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

    function init(){
        // Intialize database
        database = getDatabase(app);

        // Setup autocomplete 
        new google.maps.places.Autocomplete(
            document.getElementById("addressInput")
        );

        // Pull data from database
        let dbRef = ref(database, "Settings")
        onValue(dbRef, (snapshot) => {
            let data = snapshot.val();

            // Pull and set flock length
            if(data.FlockLength === 2){
                $("#length").text("Two Days");
            }else if(data.FlockLength === 3){
                $("#length").text("Three Days (Default)");
            }else if(data.FlockLength === 5){
                $("#length").text("Five Days");
            }else {
                $("#length").text("Seven Days");
            }

            // Pull and set nest location
            $("#location").text(data.NestLocation);
        });

        $(".modal").modal();
        $(".dropdown-trigger").dropdown();
        $("#logout").on("click", logout);
        $(".migrationLength").on("click", changeLength);

        $("#addressInput").keyup((e) => {
            if(e.keyCode === 13){
                // call edit function and pass the id of the input bo the user pressed "Enter" (keyCode: 13) on
                changeAddress(e.target.getAttribute("id"));
            }
        })
    }

    function changeAddress(id){
        let address = $("#" + id).val();
        let dbRef = ref(database, "Settings/NestLocation");
        runTransaction(dbRef, (transaction) => {
            transaction = address;
            return address;
        })
    }

    // Change focking length 
    function changeLength(){
        // Get text value of length chosen and display value
        let txtLength = $(this).text();
        $("#length").text(txtLength);

        // Take numerical value of new flocking length, parse to int, store in variable 
        let numLength = $(this).data("length-value");
        numLength = parseInt(numLength);

        // Make ref to database and run transaction, updating flocking length value
        let dbRef = ref(database, "Settings/FlockLength");
        runTransaction(dbRef, (transaction) => {
            transaction = numLength;
            return transaction;
        })
    }

    // Log out user
    function logout(){
        signOut(auth).then(() => {
            location.replace("../html/backendLogin.html");
        });
    }
})();