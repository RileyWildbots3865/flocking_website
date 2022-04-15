import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js"
import { getDatabase, ref, set, child, get, off, onValue, runTransaction  } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js"

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

    let app = initializeApp(firebaseConfig);
    let database;
    let correctFID = false;

    function init(){
         // Intialize database
         database = getDatabase(app);

         // Setup autocomplete 
         new google.maps.places.Autocomplete(
             document.getElementById("flockeeAddress")
         );

         new google.maps.places.Autocomplete(
            document.getElementById("userAddress")
         )

        $(".submit").on("click", submit);
    }

    function submit(){
        let userAddresss = $("#userAddress").val();
        let fid = $("#fid").val();
        let flockeeAddress = $("#flockeeAddress").val();
        let multipleAddresses = $("#multiple").val();
        let flockee = $("#flockeeName").val();
        
        let flocker;

        let dbRef = ref(getDatabase());
        get(child(dbRef, "VisitingAddresses")).then((snapshot) => {
            let data = snapshot.val();
            for(let i in data){
                let temp = data[i].split("/");
                let address = temp[0];
                let fidConfirm = temp[1];

                if(fid === fidConfirm){
                    correctFID = true;

                    // Get flocker from db
                    get(child(dbRef, "Flocks/" + fidConfirm + "/Flockee")).then((snapshot) => {
                        if(snapshot){
                            flocker = snapshot.val();
                        }
                    })

                    get(child(dbRef, "AlreadyFlocked")).then((snapshot) => {
                        let data = snapshot.val();
                        if(!data){
                            let dbUpdateRef = ref(database, "Flocks/" + fidConfirm + "/MigrationLocation");
                            runTransaction(dbUpdateRef, (transaction) => {
                                transaction = flockeeAddress;
                                return transaction;
                            }).then(() => {
                                let dbStatusUpdateRef = ref(database, "Flocks/" + fidConfirm + "/Status");
                                runTransaction(dbStatusUpdateRef, (transaction) => {
                                    transaction = "migrating soon";
                                    return transaction;
                                }).then(() => {
                                    let dbFlockeeRef = ref(database, "Flocks/" + fidConfirm + "/Flockee");
                                    runTransaction(dbFlockeeRef, (transaction) => {
                                        console.log(flockee);
                                        transaction = flockee;
                                        return transaction;
                                    }).then(() => {
                                        let dbFlockerRef = ref(database, "Flocks/" + fidConfirm + "/Flocker");
                                        runTransaction(dbFlockerRef, (transaction) => {
                                            transaction = flocker;
                                            return transaction;
                                        }).then(() => {
                                            $(".formContain").css("display", "none");
                                            $(".thankYou").css("display", "block");
                                        })
                                    })
                                });
                            });
                        }else{
                            for(let i in data){
                                if(data[i] === address){
                                    $(".toBeFlocked").css("display", "block");
                                    return;
                                }else{
                                    let dbUpdateRef = ref(database, "Flocks/" + fidConfirm + "/MigrationLocation");
                                    runTransaction(dbUpdateRef, (transaction) => {
                                        transaction = flockeeAddress;
                                        return transaction;
                                    }).then(() => {
                                        let dbStatusUpdateRef = ref(database, "Flocks/" + fidConfirm + "/Status");
                                        runTransaction(dbStatusUpdateRef, (transaction) => {
                                            transaction = "migrating soon";
                                            return transaction;
                                        }).then(() => {
                                            let dbFlockeeRef = ref(database, "Flocks/" + fidConfirm + "/Flockee");
                                            runTransaction(dbFlockeeRef, (transaction) => {
                                                console.log(flockee);
                                                transaction = flockee;
                                                return transaction;
                                            }).then(() => {
                                                let dbFlockerRef = ref(database, "Flocks/" + fidConfirm + "/Flocker");
                                                runTransaction(dbFlockerRef, (transaction) => {
                                                    transaction = flocker;
                                                    return transaction;
                                                }).then(() => {
                                                    $(".formContain").css("display", "none");
                                                    $(".thankYou").css("display", "block");
                                                })
                                            })
                                        });
                                    })
                                }
                            }
                        }
                    });
                }
            }

            if(!correctFID){
                $(".red").css("display", "block"); 
            }
        });
    }
})();