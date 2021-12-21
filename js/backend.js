// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
(function(){
    const firebaseConfig = {
        apiKey: "AIzaSyDmGzib6yVhgjva6k42SHMisKUOz46hw_A",
        authDomain: "flocking-management-system.firebaseapp.com",
        projectId: "flocking-management-system",
        storageBucket: "flocking-management-system.appspot.com",
        messagingSenderId: "1015768786861",
        appId: "1:1015768786861:web:a8e30c3d2ebc443935e324"
    };

    let firebase;
    $(document).ready(init);

    function init(){
        firebase = initializeApp(firebaseConfig);        

        // Setup autocomplete 
        new google.maps.places.Autocomplete(
            document.getElementById("addressInput")
        );

        $(".modal").modal();
        $("#submitAddress").on("click", addAddress);
    }

    function addAddress(){
        let address = $("#addressInput").val();
        console.log(address);
    }
})();