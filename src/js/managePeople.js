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

    // Check for an authenticated user, if true, continue running program
    onAuthStateChanged(auth, (user) => {
        if(user){
            $(document).ready(init);
        }
    });

    // Function ran when page document loads 
    function init(){
        // Intialize database
        database = getDatabase(app);

        // Setup autocomplete 
        new google.maps.places.Autocomplete(
            document.getElementById("addressInput")
        );

        let dbRef = ref(database, "Users");
        onValue(dbRef, (snapshot) => {
            $("#peopleTableBody").empty();
            let data = snapshot.val();
            console.log(data);
            for(let i in data){
                let canDrive;
                let hasVehcile;
                let removalEmail;

                if(data[i].Information.CanDrive === true){
                    canDrive = "Yes";
                }else {
                    canDrive = "No";
                }

                if(data[i].Information.HasVehicle === true){
                    hasVehcile = "Yes";
                }else {
                    hasVehcile = "No";
                }

                if(data[i].Information.SendRemovalEmail === true){
                    removalEmail = "Yes";
                }else {
                    removalEmail = "No";
                }

                let tr = document.createElement("tr");

                let name_td = document.createElement("td");
                name_td.textContent = data[i].Information.FirstName + " " + data[i].Information.LastName;
                name_td.classList.add('col');
                name_td.classList.add("s2");
                name_td.classList.add("m3");
                tr.appendChild(name_td);

                let flock_td = document.createElement("td");
                let flock_ul = document.createElement("ul");
                let manageBtn = document.createElement("button");
                let manage_li = document.createElement("li");
                flock_td.appendChild(flock_ul);
                flock_td.classList.add("col");
                flock_td.classList.add("s4");
                flock_td.classList.add("m2");
                flock_td.classList.add("center");
                flock_td.classList.add("flocks");
                flock_ul.classList.add("flockUl");
                manage_li.classList.add("btnLi");
                manageBtn.textContent = "Manage Flocks";
                manageBtn.classList.add("manageFlock");
                manageBtn.classList.add("modal-trigger");
                manageBtn.id = i;
                $(manageBtn).attr("data-target", "manageFlockModal");
                $(manageBtn).attr("data-name", data[i].Information.FirstName + " " + data[i].Information.LastName)
                manage_li.appendChild(manageBtn);
                // flock_ul.appendChild(manage_li);

                // If this user currently isn't responsible for any flocks (no flocks in their responsibility queue) display "No Flock Responsibilites"
                if(!data[i].FlockResponsibilities){
                    let span = document.createElement("span");
                    span.textContent = "No Flock Responsibilites"
                    flock_td.appendChild(span);
                    flock_td.appendChild(flock_ul);
                }else{
                    // Loop through and create li for each of their flocks they are responsibile for
                    for(let x in data[i].FlockResponsibilities){
                        let flock_li = document.createElement("li");
                        flock_li.textContent = data[i].FlockResponsibilities[x];
                        flock_ul.appendChild(flock_li);
                    }
                }

                flock_ul.appendChild(manage_li);
                tr.appendChild(flock_td);

                // Elements for Can Driev Column 
                let canDrive_td = document.createElement("td");
                let canDriveBtn = document.createElement("button")
                canDrive_td.classList.add('col');
                canDrive_td.classList.add("s2");
                canDrive_td.classList.add("m2");
                canDrive_td.classList.add("center");
                canDriveBtn.textContent = canDrive;
                canDriveBtn.id = i;
                canDriveBtn.classList.add("valueBtn");
                canDriveBtn.classList.add("canDriveBtn");
                canDriveBtn.classList.add(data[i].Information.CanDrive);
                canDrive_td.appendChild(canDriveBtn);
                tr.appendChild(canDrive_td);

                // Elements for Has Vehicle Column 
                let hasVehicle_td = document.createElement("td");
                let hasVehcileBtn = document.createElement("button");
                hasVehicle_td.classList.add('col');
                hasVehicle_td.classList.add("s2");
                hasVehicle_td.classList.add("m2");
                hasVehicle_td.classList.add("center");
                hasVehcileBtn.textContent = hasVehcile;
                hasVehcileBtn.id = i;
                hasVehcileBtn.classList.add("valueBtn");
                hasVehcileBtn.classList.add("hasVehicleBtn");
                hasVehcileBtn.classList.add(data[i].Information.HasVehicle);
                hasVehicle_td.appendChild(hasVehcileBtn);
                tr.appendChild(hasVehicle_td);

                // Elements for Removal Email Column 
                let removalEmail_td = document.createElement("td");
                let removalEmailBtn = document.createElement("button");
                removalEmail_td.classList.add('col');
                removalEmail_td.classList.add("s2");
                removalEmail_td.classList.add("m3");
                removalEmail_td.classList.add("center");
                removalEmailBtn.textContent = removalEmail;
                removalEmailBtn.id = i;
                removalEmailBtn.classList.add("valueBtn");
                removalEmailBtn.classList.add("removalEmailBtn");
                removalEmailBtn.classList.add(data[i].Information.SendRemovalEmail);
                removalEmail_td.appendChild(removalEmailBtn);
                tr.appendChild(removalEmail_td);

                $("#peopleTableBody").append(tr);
            }
        })

        $(document.body).on("click", ".canDriveBtn", changeDriveValue);
        $(document.body).on("click", ".hasVehicleBtn", changeVehicleValue);
        $(document.body).on("click", ".removalEmailBtn", changeEmailValue);
        $(document.body).on("click", ".manageFlock", manageFlock);
        $(document.body).on("click", ".availableFlockBtn", assignFlock);
        $(document.body).on("click", ".removeFlockBtn", removeFlock);

        $(".modal").modal();
        $(".dropdown-trigger").dropdown();
        $(".tooltipped").tooltip();
        $("#logout").on("click", logout);
    }

    function removeFlock(){
        // Get UID and FID
        let uid = $(this).attr("data-uid");
        let fid = $(this).attr("id");

        // Create database refs
        let flockdbRef = ref(database, "Flocks/" + fid + "/FlockCarrier");
        let userdbRef = ref(database, "Users/" + uid + "/FlockResponsibilities");

        // Empty respective divs to account for data update
        $("#flockResponsibilites").empty();
        $("#availableFlocks").empty();

        runTransaction(flockdbRef, (transaction) => {
            let index = transaction.indexOf(uid);
            transaction.splice(index, 1);
            return transaction;
        }).then(() => {
            runTransaction(userdbRef, (transactionTwo) => {
               let index = transactionTwo.indexOf(fid);
               transactionTwo.splice(index, 1);
               console.log(transactionTwo);
               return transactionTwo;
            })
        })
    }

    // Assign an avaiable flock to a user.
    function assignFlock(){
        // Get UID and FID
        let uid = $(this).attr("data-uid");
        let fid = $(this).attr("id");

        // Create database refs
        let flockdbRef = ref(database, "Flocks/" + fid + "/FlockCarrier");
        let userdbRef = ref(database, "Users/" + uid + "/FlockResponsibilities");

        // Empty respective divs to account for data update
        $("#flockResponsibilites").empty();
        $("#availableFlocks").empty();

        runTransaction(flockdbRef, (transaction) => {
            if(!transaction){
                transaction = [uid];
                return transaction;
            }else{
                let temp = transaction;
                temp.push(uid);
                transaction = temp;
                return transaction;
            }
        }).then(() => {
            runTransaction(userdbRef, (transactionTwo) => {
                if(!transactionTwo){
                    transactionTwo = [fid];
                    return transactionTwo;
                }else{
                    let temp = transactionTwo;
                    temp.push(fid);
                    transactionTwo = temp;
                    return transactionTwo;
                }
            })
        })
    }

    // Function for managing which users have which flocks 
    function manageFlock(){
        // Get ID and user's name from button clicked.
        let id = $(this).attr("id");
        let name = $(this).attr("data-name");

        // Create database refs
        let dbUserInfoRef = ref(database, "Users/" + id + "/FlockResponsibilities");
        let flockdbRef = ref(database, "Flocks");

        // Add name to existing h5
        $("#name").text("Manage Flocks for " + name);

        // Empty respective divs to account for data update
        $("#flockResponsibilites").empty();
        $("#availableFlocks").empty();

        // create listner to database 
        onValue(dbUserInfoRef, (snapshot) => {
            let data = snapshot.val();
            // if user is not responsible for a flock display hidden p
            if(!data){
                $("#noFlocks").css("display", "block");
            }else{
                $("#noFlocks").css("display", "none");
                console.log(data);
                for(let i in data){
                    let li = document.createElement("li");
                    li.classList.add("col");
                    li.classList.add("m4");

                    let btn = document.createElement("button");
                    btn.textContent = data[i];
                    btn.id = data[i];
                    btn.classList.add("col");
                    btn.classList.add("m12");
                    btn.classList.add("removeFlockBtn");
                    $(btn).attr("data-uid", id);
                    li.appendChild(btn);

                    $("#flockResponsibilites").append(li);

                    // let li = document.createElement("li");
                    // li.textContent = data[i];
                    // li.classList.add("col");
                    // li.classList.add("m4");
                    // li.classList.add("currentFlock");
    
                    // let span = document.createElement("span");
                    // span.textContent = data[i];
                    // span.classList.add("col");
                    // span.classList.add("m6");
                    // li.appendChild(span);
    
                    // let removeBtn = document.createElement("button");
                    // removeBtn.id = data[i];
                    // removeBtn.classList.add("col");
                    // removeBtn.classList.add("m4");
                    // removeBtn.classList.add("removeFlock");
                    // li.appendChild(removeBtn);
    
                    // let removeIcon = document.createElement("i");
                    // removeIcon.classList.add("material-icons");
                    // removeIcon.textContent = "close";
                    // removeBtn.appendChild(removeIcon);
    
                    $("#flockResponsibilites").append(li);
                }
            }
        });

        // Create listener to flocks in database
        onValue(flockdbRef, (snapshot) => {
            let data = snapshot.val();
            
            // Loop through each flock, check if they are currently available or not
            for(let i in data){
                // If flock doesn't have a flcok carrier list it as avaiable 
                if(!data[i].FlockCarrier || data[i].FlockCarrier === null || data[i].FlockCarrier === ""){
                    let li = document.createElement("li");
                    li.classList.add("col");
                    li.classList.add("m4");

                    let btn = document.createElement("button");
                    btn.textContent = i;
                    btn.id = i;
                    btn.classList.add("col");
                    btn.classList.add("m12");
                    btn.classList.add("availableFlockBtn");
                    $(btn).attr("data-uid", id);
                    li.appendChild(btn);

                    $("#availableFlocks").append(li);
                }
            }
        })

    }

    // Change the value of SendRemovalEmail in Firebase 
    function changeDriveValue(){
        // Create ref to inormation location in firebase
        let dbRef = ref(database, "Users/" + $(this).attr("id") + "/Information/CanDrive")
        // If statement to check the current value of the button clicked
        // Change the value based on the current value: if true, change to false and vice versa 
        if($(this).hasClass("true")){
            runTransaction(dbRef, (transaction) => {
                transaction = false;
                return transaction;
            })
        }else{
            runTransaction(dbRef, (transaction) => {
                transaction = true;
                return transaction;
            })        
        }
    }

    // Change the value of changeVehicleValue in Firebase 
    function changeVehicleValue(){
        // Create ref to inormation location in firebase
        let dbRef = ref(database, "Users/" + $(this).attr("id") + "/Information/HasVehicle")
        // If statement to check the current value of the button clicked
        // Change the value based on the current value: if true, change to false and vice versa 
        if($(this).hasClass("true")){
            runTransaction(dbRef, (transaction) => {
                transaction = false;
                return transaction;
            })
        }else{
            runTransaction(dbRef, (transaction) => {
                transaction = true;
                return transaction;
            })        
        }
    }

    // Change the value of SendRemovalEmail in Firebase 
    function changeEmailValue(){
        // Create ref to inormation location in firebase
        let dbRef = ref(database, "Users/" + $(this).attr("id") + "/Information/SendRemovalEmail")
        // If statement to check the current value of the button clicked
        // Change the value based on the current value: if true, change to false and vice versa 
        if($(this).hasClass("true")){
            runTransaction(dbRef, (transaction) => {
                transaction = false;
                return transaction;
            })
        }else{
            runTransaction(dbRef, (transaction) => {
                transaction = true;
                return transaction;
            })        
        }
    }

    // Log out user
    function logout(){
        signOut(auth).then(() => {
            location.replace("../html/backendLogin.html");
        });
    }
})();