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

    let href = window.location.href;
    href = href.split("?FID=");
    
    let fid = href[1];

    let nestLocation;

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
            document.getElementById("CurrentLocationEdit"),
        );

        new google.maps.places.Autocomplete(
            document.getElementById("MigrationLocationEdit")
        );

        // Get "nest locaiton" from db
        let dbNestLocationRef = ref(database, "Settings/NestLocation");
        onValue(dbNestLocationRef, (snapshot) => {
            nestLocation = snapshot.val();
        });

        let dbRef = ref(database, "Flocks/" + fid);
        onValue(dbRef, (snapshot) => {
            let data = snapshot.val();

            let currentAdxdressMod;
            let migrationAddressMod;

            // Empty all spans with class "data". Includes FID and Status
            $(".data").empty();

            if(!data.CurrentLocation){
                console.log(nestLocation);
                currentAdxdressMod = modifyAddress(nestLocation);
            }else{
                currentAdxdressMod = modifyAddress(data.CurrentLocation);
            }

            $("#fid").append(fid);
            $("#status").append(data.Status);
            if(!data.CurrentLocation){
                $("#currentLocation").append(nestLocation);
            }else{
                $("#currentLocation").append(data.CurrentLocation);
            }

            $("#currentLocationMap").attr("src", "https://www.google.com/maps/embed/v1/place?key=AIzaSyCre3swIR5kW1SRxwfKgR51Sxumg1I-BpA&q=" + currentAdxdressMod);
            // $("#migrationLocationMap").attr("src", "https://www.google.com/maps/embed/v1/place?key=AIzaSyCre3swIR5kW1SRxwfKgR51Sxumg1I-BpA&q=" + modifyAddress(data.MigrationLocation));

            if(!data.MigrationLocation){
                $("#migrationLocation").append("No Current Migration Location");
                $(".noMigration").css("display", "block");
            }else{
                $("#migrationLocation").append(data.MigrationLocation);
                $("#migrationLocationMap").attr("src", "https://www.google.com/maps/embed/v1/place?key=AIzaSyCre3swIR5kW1SRxwfKgR51Sxumg1I-BpA&q=" + modifyAddress(data.MigrationLocation));
            }

            if(!data.ArrivalDate){
                $("#arrivalDate").append("No Current Arrival Date");
            }else{
                $("#arrivalDate").append(data.ArrivalDate);
            }

            if(!data.MigrationDate){
                $("#migrationDate").append("No Current Migration Date");
            }else{
                $("#migrationDate").append(data.MigrationDate);
            }

            if(!data.Flocker){
                $("#flocker").append("No Current Flocker");
            }else{
                $('#flocker').append(data.Flocker);
            }

            if(!data.Flockee){
                $("#flockee").append("No Current Flockee");
            }else{
                $('#flockee').append(data.Flockee);
            }

            if(!data.FlockCarrier){
                $("#flockManagers").append("No Current Manager(s)");
            }else{
                for(let i in data.FlockCarrier){
                    let userRef = ref(database, "Users/" + data.FlockCarrier[i] + "/Information");
                    onValue(userRef, (snapshot) => {
                        let dataTwo = snapshot.val();
                        let nameBtn = document.createElement("button");
                        nameBtn.id = data.FlockCarrier[i];
                        nameBtn.textContent = dataTwo.FirstName + " " + dataTwo.LastName;
                        nameBtn.classList.add("removeFlockManager");
                        $("#flockManagers").append(nameBtn);
                    });
                }
            }
        });

        $(".modal").modal();
        $("#logout").on("click", logout);
        $(".tooltipped").tooltip();
        $('#nest').on("click", nest);

        $(document.body).on("click", ".removeFlockManager", removeManager);
        $(".editBtn").on("click", displayEdit);
        $(".edit").keyup((e) => {
            if(e.keyCode === 13){
                // call edit function and pass the id of the input bo the user pressed "Enter" (keyCode: 13) on
                edit(e.target.getAttribute("id"));
            }
        })
    }

    function nest(){
        let dbRef = ref(database, "Flocks/" + fid + "/Status");
        runTransaction(dbRef, (transaction) => {
            transaction = "nested";
            return transaction;
        }).then(() => {
            let dbRef = ref(database, "Flocks/" + fid + "/MigrationLocation");
            runTransaction(dbRef, (transaction) => {
                transaction = "";
                return transaction;
            }).then(() => {
                let dbRef = ref(database, "Flock/" + fid + "/CurrentLocation");
                runTransaction(dbRef, (transaction) => {
                    transaction = nestLocation;
                    return transaction;
                })
            })
        });
    }

    function removeManager(){
        let uid = $(this).attr("id");

        // Create database refs
        let flockdbRef = ref(database, "Flocks/" + fid + "/FlockCarrier");

        runTransaction(flockdbRef, (transaction) => {
            let index = transaction.indexOf(uid);
            transaction.splice(index, 1);
            return transaction;
        }).then(removeAgain(uid));
    }

    function removeAgain(uid){
        let path = "Users/" + uid + "/FlockResponsibilities";
        let userdbRef = ref(database, path);

        onValue(userdbRef, (snapshot) => {
            let data = snapshot.val();
            let index = data.indexOf(fid);
            data.splice(index, 1);
            set(ref(database, path), data)
        });
        // runTransaction(userdbRef, (transactionTwo) => {
        //     console.log(transactionTwo);
        //     let index = transactionTwo.indexOf(fid);
        //     transactionTwo.splice(index, 1);
        //     console.log(transactionTwo);
        //     return transactionTwo;
        // })
    }

    // Edit data
    function edit(id){
        // Get id of input box and rearrage to use in firebase path
        id = id.split("Edit");
        let path_portion = id[0];

        // Get new value to update in firebase using id aquired above
        let value = $("#" + path_portion + "Edit").val();

        // Rearrange date order and use "/" instead of "-"
        if($("#" + path_portion + "Edit").attr("type") === "date"){
            let temp_value = value.split("-");
            value = temp_value[1] + "/" + temp_value[2] + "/" + temp_value[0];
        }

        // Clear and toggle input box
        $("#" + path_portion + "Edit").text(" ");
        $("#" + path_portion + "Edit").css("visibility", "hidden");

        if(path_portion === "CurrentLocation"){
            let currentAddressAndFID = $("#currentLocation").text() + "/" + fid;
            let newAddressAndFID = value + "/" + fid;
            let dbRef = ref(database, "VisitingAddresses");

            console.log(currentAddressAndFID, newAddressAndFID);
            runTransaction(dbRef, (transaction) => {
                let temp_index;
                for(let i in transaction){
                    if(currentAddressAndFID === transaction[i]){
                        console.log("working");
                        // transaction[i] = newAddressAndFID;
                        temp_index = i
                        // return transaction;
                    }
                }

                transaction[temp_index] = newAddressAndFID;
                console.log(transaction);
                return transaction;
            }).then(() => {
                // Firebase reference and transaction
                let dbRef = ref(database, "Flocks/" + fid + "/" + path_portion);
                runTransaction(dbRef, (transaction) => {
                    transaction = value;
                    return transaction;
                })
            });
        }else{
            // Firebase reference and transaction
            let dbRef = ref(database, "Flocks/" + fid + "/" + path_portion);
            runTransaction(dbRef, (transaction) => {
                transaction = value;
                return transaction;
            })
        }
    }

    // Toggle input box views
    function displayEdit(){
        let class_temp = $(this).attr("id");
        class_temp = class_temp.split("EditBtn");
        let id = class_temp[0];

        if($("#" + id + "Edit").css("visibility") === "hidden"){
            $("#" + id + "Edit").css("visibility", "visible");
        }else{
            $("#" + id + "Edit").css("visibility", "hidden");
        }
    }

    // Log out user
    function logout(){
        signOut(auth).then(() => {
            location.replace("../html/backendLogin.html");
        });
    }

    // Function for modiying addresses to use in Google Maps API 
    function modifyAddress(address){
        // Declare variables to use 
        let hasComma = false;
        let modAddress; 
        let addressSplit;
        let id;
        
        // Split address into parts to rearrange 
        addressSplit = address.split(" ");
        id = addressSplit[1] + addressSplit[0];
        modAddress = addressSplit[0];
        addressSplit.shift();

        // Loop through address parts and rearrange
        for(let i in addressSplit){
            if(addressSplit[i].includes(",")){
                if(hasComma){
                    modAddress = modAddress + addressSplit[i];
                }else{
                    modAddress = modAddress + "+" + addressSplit[i];
                }
                hasComma = true;
            }else{
                if(hasComma){
                    modAddress = modAddress + addressSplit[i]
                    hasComma = false;
                }else{
                    modAddress = modAddress + "+" + addressSplit[i]
                }
            }
        }

        return modAddress
    }
})();