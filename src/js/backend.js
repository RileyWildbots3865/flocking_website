import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js"
import { getDatabase, ref, set, child, get, off, onValue, runTransaction  } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js"
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

(function(){
    const firebaseConfig = {
        apiKey: "AIzaSyDmGzib6yVhgjva6k42SHMisKUOz46hw_A",
        authDomain: "flocking-management-system.firebaseapp.com",
        projectId: "flocking-management-system",
        storageBucket: "flocking-management-system.appspot.com",
        messagingSenderId: "1015768786861",
        appId: "1:1015768786861:web:a8e30c3d2ebc443935e324"
    };

    let app = initializeApp(firebaseConfig);
    let auth = getAuth();
    let database;

    let nestLocation;
    let flockDuration;

    let currentDate = new Date().toLocaleDateString();

    // Check for an authenticated user, if true, continue running program
    onAuthStateChanged(auth, (user) => {
        if(user){
            $(document).ready(init);
        }
    });

    function init(){
        // Intialize database
        database = getDatabase(app);

        // Setup autocomplete 
        new google.maps.places.Autocomplete(
            document.getElementById("addressInput")
        );

        // Get "nest locaiton" from db
        let dbNestLocationRef = ref(database, "Settings/NestLocation");
        onValue(dbNestLocationRef, (snapshot) => {
            nestLocation = snapshot.val();
            // console.log(nestLocation);
        });

        // Get flock duration from db
        let dbFlockDurationRef = ref(database, "Settings/FlockLength");
        onValue(dbFlockDurationRef, (snapshot) => {
            flockDuration = snapshot.val();
        })

        // Get data for 'Visiting' table
        let dbVisitingRef = ref(database, 'VisitingAddresses');
        onValue(dbVisitingRef, (snapshot) => {
            $("#visitingTableBody").empty();
            let visitingList = snapshot.val();

            for(let i in visitingList){
                let addressAndFID = visitingList[i];
                let temp_array = addressAndFID.split("/");
                let address = temp_array[0];
                let fid = temp_array[1];
                let tr = document.createElement("tr");

                // Flock ID
                let fid_td = document.createElement("td");
                fid_td.textContent = fid;
                fid_td.classList.add("col");
                fid_td.classList.add("m2");
                fid_td.classList.add("fid")

                // Append FID td to tr
                tr.appendChild(fid_td);

                // Create td for address 
                let address_td = document.createElement("td");
                address_td.textContent = address;
                address_td.classList.add("col");
                address_td.classList.add("m8");
                address_td.classList.add("center");

                tr.appendChild(address_td);

                // Craete td for "manage flock" button
                let manageFlock_td = document.createElement("td");
                manageFlock_td.classList.add("col");
                manageFlock_td.classList.add("m2");
                // manageFlock_td.classList.add("offset-m4");
                manageFlock_td.classList.add("manage_td");

                // Append manageFlock_td to tr
                tr.appendChild(manageFlock_td);

                // Create Manage Flock button
                let manageBtn = document.createElement("a");
                manageBtn.textContent = "Manage Flock";
                manageBtn.classList.add("manageAnchor");
                manageBtn.href = "../html/manageFlock.html?FID=" + fid;
                manageFlock_td.appendChild(manageBtn);

                $("#visitingTableBody").append(tr);
            }
        });

        // Get data for 'To Be Flocked' table
        // dbRef = ref(database, 'to_be_flocked');
        // onValue(dbRef, (snapshot) => {
        //     console.log("working");
        //     $("#toBeFlockedTableBody").empty();
        //     let toBeFlockedList = snapshot.val();

        //     for(let i in toBeFlockedList){
        //         let tr = document.createElement("tr");

        //         // Create modAddress var
        //         let hasComma = false;
        //         let modAddress;
        //         let addressSplit = toBeFlockedList[i].split(" ");
        //         let id = addressSplit[1] + addressSplit[0];
        //         modAddress = addressSplit[0];
        //         addressSplit.shift();

        //         for(let i in addressSplit){
        //             if(addressSplit[i].includes(",")){
        //                 if(hasComma){
        //                     modAddress = modAddress + addressSplit[i];
        //                 }else{
        //                     modAddress = modAddress + "+" + addressSplit[i];
        //                 }
        //                 hasComma = true;
        //             }else{
        //                 if(hasComma){
        //                     modAddress = modAddress + addressSplit[i]
        //                     hasComma = false;
        //                 }else{
        //                     modAddress = modAddress + "+" + addressSplit[i]
        //                 }
        //             }
        //         }

        //         // Address
        //         let address_td = document.createElement("td");
        //         address_td.textContent = toBeFlockedList[i];
        //         address_td.classList.add("col");
        //         address_td.classList.add("m6");
        //         address_td.classList.add("address")

        //         tr.appendChild(address_td);

        //         // map iframe
        //         // let iframe = document.createElement("iframe");
        //         // iframe.width = 600;
        //         // iframe.height = 450;
        //         // iframe.style = "border:0";
        //         // iframe.allowFullscreen;
        //         // iframe.src = "https://www.google.com/maps/embed/v1/place?key=AIzaSyCre3swIR5kW1SRxwfKgR51Sxumg1I-BpA&q=" + modAddress;
        //         // modalContentDiv.appendChild(iframe);

        //         // Move to Visiting
        //         let visiting_td = document.createElement("td");
        //         visiting_td.classList.add("col");
        //         visiting_td.classList.add("m2");
        //         visiting_td.classList.add("offset-m4");
        //         visiting_td.classList.add("center-align");
                
        //         let visitingBtn = document.createElement("button");
        //         visitingBtn.textContent = "Move to Visiting"
        //         visitingBtn.id = toBeFlockedList[i];
        //         visitingBtn.classList.add("visitingBtn");
        //         visitingBtn.classList.add("tableBtn")
        //         visiting_td.appendChild(visitingBtn);

        //         tr.appendChild(visiting_td);

        //         $("#toBeFlockedTableBody").append(tr);
        //     }
        // });

        // Append flocks to "Migrating Soon" table in realtime as flock statuses change
        let dbRef = ref(database, 'Flocks');
        onValue(dbRef, (snapshot) => {
            $("#migratingTableBody").empty();
            let data = snapshot.val();
            // Loop through flock list
            for(let i in data){
                // Create table row if status equals nested
                if(data[i].Status === "migrating soon"){
                    // tr
                    let tr = document.createElement("tr");

                    // Flock ID
                    let fid_td = document.createElement("td");
                    fid_td.textContent = i;
                    fid_td.classList.add("col");
                    fid_td.classList.add("m1");
                    fid_td.classList.add("fid")

                    // Append FID td to tr
                    tr.appendChild(fid_td);

                    // Create td for address 
                    let address_td = document.createElement("td");
                    address_td.textContent = data[i].MigrationLocation;
                    address_td.classList.add("col");
                    address_td.classList.add("m7");
                    address_td.classList.add("center");

                    tr.appendChild(address_td);

                    // Craete td for "manage flock" button
                    let manageFlock_td = document.createElement("td");
                    manageFlock_td.classList.add("col");
                    manageFlock_td.classList.add("m2");
                    // manageFlock_td.classList.add("offset-m4");
                    manageFlock_td.classList.add("manage_td");

                    // Append manageFlock_td to tr
                    tr.appendChild(manageFlock_td);

                    // Create Manage Flock button
                    let manageBtn = document.createElement("a");
                    manageBtn.textContent = "Manage Flock";
                    manageBtn.classList.add("manageAnchor");
                    manageBtn.href = "../html/manageFlock.html?FID=" + i;
                    manageFlock_td.appendChild(manageBtn);

                    // Craete td for "Move to Visiting" button
                    let visitingBtn_td = document.createElement("td");
                    visitingBtn_td.classList.add("col");
                    visitingBtn_td.classList.add("m2");
                    // manageFlock_td.classList.add("offset-m4");
                    visitingBtn_td.classList.add("visiting_td");

                    // Append visitingBtn_td to tr
                    tr.appendChild(visitingBtn_td);

                    // Create Move to Visiting button
                    let visitingBtn = document.createElement("button");
                    visitingBtn.id = i;
                    $(visitingBtn).attr("data-address", data[i].MigrationLocation);
                    visitingBtn.textContent = "Move to Visiting";
                    visitingBtn.classList.add("visitingBtn");
                    visitingBtn_td.appendChild(visitingBtn);

                    // Append tr to migratingTableBody
                    $("#migratingTableBody").append(tr);
                }
            }
        });

        // Append flocks to "Nested" table in realtime as flock statuses change
        onValue(dbRef, (snapshot) => {
            $("#nestedTableBody").empty();
            let data = snapshot.val();
            // Loop through flock list
            for(let i in data){
                // Create table row if status equals nested
                if(data[i].Status === "nested"){
                    // tr
                    let tr = document.createElement("tr");

                    // Flock ID
                    let fid_td = document.createElement("td");
                    fid_td.textContent = i;
                    fid_td.classList.add("col");
                    fid_td.classList.add("m2");
                    fid_td.classList.add("fid")

                    // Append FID td to tr
                    tr.appendChild(fid_td);

                    // Create td for address 
                    let address_td = document.createElement("td");
                    address_td.textContent = nestLocation;
                    address_td.classList.add("col");
                    address_td.classList.add("m8");
                    address_td.classList.add("center");

                    tr.appendChild(address_td);

                    // // Craete td for "manage flock" button
                    // let manageFlock_td = document.createElement("td");
                    // manageFlock_td.classList.add("col");
                    // manageFlock_td.classList.add("m2");
                    // // manageFlock_td.classList.add("offset-m4");
                    // manageFlock_td.classList.add("manage_td");

                    // // Append manageFlock_td to tr
                    // tr.appendChild(manageFlock_td);

                    // // Create Manage Flock link
                    // let manageBtn = document.createElement("button");
                    // manageBtn.textContent = "Manage Flock";
                    // manageBtn.classList.add("manageBtn");
                    // manageBtn.id = i;
                    // manageFlock_td.appendChild(manageBtn);

                    // Append tr to nestedTableBody
                    $("#nestedTableBody").append(tr);
                }
            }
        });

        $(".modal").modal();
        $(".dropdown-trigger").dropdown();
        $("#logout").on("click", logout);
        $(document.body).on("click", ".visitingBtn", moveToVisiting);

        $("#submitAddress").on("click", addAddress);
    }

    // Log out user
    function logout(){
        signOut(auth).then(() => {
            location.replace("../html/backendLogin.html");
        });
    }

    function moveToVisiting(){
        let fid = $(this).attr("id");
        let address = $(this).attr("data-address");
        let addressAndFID = address + "/" + fid;

        let dbStatusRef = ref(database, 'Flocks/' + fid + "/Status");
        runTransaction(dbStatusRef, (transaction) => {
            transaction = "visiting";
            return transaction;
        }).then(() => {
            let dbMigrationRef = ref(database, "Flocks/" + fid + "/MigrationLocation");
            runTransaction(dbMigrationRef, (transaction) => {
                transaction = "";
                return transaction
            }).then(() => {
                let dbCurrentLocationRef = ref(database, "Flocks/" + fid + "/CurrentLocation");
                runTransaction(dbCurrentLocationRef, (transaction) => {
                    transaction = address;
                    return transaction;
                }).then(() => {
                    let dbVisitingRef = ref(database, "VisitingAddresses");
                    runTransaction(dbVisitingRef, (transaction) => {
                        if(!transaction){
                            transaction = [addressAndFID];
                            return transaction;
                        }else{
                            let tempArr = [];
                            for(let i in transaction){
                                let temp = transaction[i].split("/");
                                let fidCheck = temp[1];
                                tempArr.push(fidCheck);
                            }

                            if(tempArr.includes(fid)){
                                let index = tempArr.indexOf(fid);
                                let temp = transaction;
                                temp.splice(index, 1);
                                temp.push(addressAndFID);
                                transaction = temp;
                                return transaction;
                            }else{
                                let temp = transaction;
                                temp.push(addressAndFID)
                                transaction = temp;
                                return transaction;
                            }
                        }
                    }).then(() => {
                        let dbArrivalDateRef = ref(database, "Flocks/" + fid + "/ArrivalDate");
                        runTransaction(dbArrivalDateRef, (transaction) => {
                            transaction = currentDate;
                            return transaction;
                        }).then(() => {
                            let dbMigrationDateRef = ref(database, "Flocks/" + fid + "/MigrationDate");
                            runTransaction(dbMigrationDateRef, (transaction) => {
                                let temp = currentDate.split("/");
                                let day = temp[1];
                                day = parseInt(day);
                                day = day + flockDuration;
                                console.log(day)
                                let date = temp[0] + "/" + day.toString() + "/" + temp[2];
                                console.log(date);
                                transaction = date;
                                return transaction;
                            });
                        }).then(() => {
                            let temp = currentDate.split("/");
                            let year = temp[2];

                            let dbHistoryRef = ref(database, "History/" + year);
                            runTransaction(dbHistoryRef, (transaction) => {
                                if(!transaction){
                                    transaction = [address];
                                }else{
                                    let tempTwo = transaction;
                                    tempTwo.push(address);
                                    transaction = tempTwo;
                                }
                                return transaction;
                            });
                        })
                    })
                });
            })
        })
    }

    // Add new address, typically at the beginning of the season
    // Finds 'nested' flock and uses it.
    function addAddress(){
        // Get Address
        let address = $("#addressInput").val();
        // Make ref to "Flocks" in database;
        let dbref = ref(database);
        // Get list of flocks
        get(child(dbref, 'Flocks')).then((snapshot) => {
            // Set snapshot equal to a variable 
            let data = snapshot.val();
            // Loop through list of flocks
            for(let i in data){
                // Check for flocks that are "nested." These are the flocks that we want changed to "migrating soon"
                if(data[i].Status === "nested"){
                    // Create a new database reference to the flock that has a status of "nested"
                    let dbref = ref(database, 'Flocks/' + i + "/MigrationLocation");
                    // Run a database transaction to change the address of the flock chosen that is currently "nested" 
                    // to the address that the flock with be "migrating soon" to
                    runTransaction(dbref, (transaction) => {
                        transaction = address;
                        return transaction;
                    }).then(() => { // Promise 
                        // Make new ref to newly modified flock's 'Status' and change it to 'migratig soon'
                        let dbref = ref(database, 'Flocks/' + i + "/Status");
                        // Run database transaction and change status from "nested" to "migrating soon"
                        runTransaction(dbref, (transaction) => {
                            transaction = "migrating soon";
                            return transaction;
                        })
                    });
                    // Break the loop
                    break;
                }
            }
        });
        // Empty address box
        $("#addressInput").val(" ");
    }
})();