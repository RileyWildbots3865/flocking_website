import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, child, get, onValue, runTransaction  } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

(function(){
    const firebaseConfig = {
        apiKey: "AIzaSyDmGzib6yVhgjva6k42SHMisKUOz46hw_A",
        authDomain: "flocking-management-system.firebaseapp.com",
        projectId: "flocking-management-system",
        storageBucket: "flocking-management-system.appspot.com",
        messagingSenderId: "1015768786861",
        appId: "1:1015768786861:web:a8e30c3d2ebc443935e324"
    };

    let app;
    let database;
    let auth;

    $(document).ready(init);

    function init(){
        app = initializeApp(firebaseConfig);     
        database = getDatabase(app);
        auth = getAuth();

        $("#signUp").on("click", passCheck);
        $("#login").on("click", login);
    }

    function login(){
        let email = $("#email").val();
        let pass = $("#pass").val();

        signInWithEmailAndPassword(auth, email, pass).then((user) => {
            console.log(user);
            location.replace("../html/backend.html");
        }).catch((err) => {
            let errCode = err.code;
            console.log(errCode);

            if(errCode === "auth/wrong-password"){
                $("#pass").css("background-color", "#FF4D4D");
            }

            if(errCode === "auth/user-not-found"){
                $("#email").css("background-color", "#FF4D4D");
            }
        });
    }

    function passCheck(){
        let pass = $("#pass").val();
        let passTwo = $("#rePass").val();

        if(pass === passTwo){
            signUp(pass);
        }else{
            $("#pass").css("border-color", "red");
            $("#rePass").css("border-color", "red");
        }
    }

    function signUp(pass){
        console.log("Working");
        let email = $("#email").val();

        let fname = $("#fname").val();
        let lname = $("#lname").val();
        let canDrive = $("#drive").is(":checked");
        let hasVehicle = $("#vehicle").is(":checked");
        console.log(canDrive);

        createUserWithEmailAndPassword(auth, email, pass).then((user) => {
            if(user){
                set(ref(database, "Users/" + user.user.uid + "/Information"), {
                    FirstName:fname,
                    LastName:lname,
                    Email:email,
                    CanDrive:canDrive,
                    HasVehicle:hasVehicle,
                    SendRemovalEmail:false,
                }).then(() => {
                    location.replace("../html/backend.html");
                })
            }
        });
    }
})();