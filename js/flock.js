(function(){
    $(document).ready(init);
    const firebaseConfig = {
        apiKey: "AIzaSyDmGzib6yVhgjva6k42SHMisKUOz46hw_A",
        authDomain: "flocking-management-system.firebaseapp.com",
        projectId: "flocking-management-system",
        storageBucket: "flocking-management-system.appspot.com",
        messagingSenderId: "1015768786861",
        appId: "1:1015768786861:web:a8e30c3d2ebc443935e324"
    };

    function init(){
        firebase.initializeApp(firebaseConfig);
        $(".submit").on("click", submit);
    }

    function submit(){
        let userAddresss = $("#userAddress");
        let flockeeAddress = $("#flockeeAddress");
        let multipleAddresses = $("#multiple");

    }
})();