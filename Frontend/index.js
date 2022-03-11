
    var options = {
        key: "rzp_test_7IGHa5Igq6Gaka",
        amount: "1",
        currency: "INR",
        name: "Dummy Academy",
        description: "Pay & Checkout this Course, Upgrade your DSA Skill",
        image: `https://media.geeksforgeeks.org/wp-content/uploads/
                        20210806114908/dummy-200x200.png`,
        order_id: "order_J5nYyM8DtOIzfN",
        handler: `function (response){
                console.log(response)
                alert("This step of Payment Succeeded");
            }`,
        prefill: {
            contact: "9714898292",
            name: "Harsh Gajera",
            email: "gajeraharsh52438@gmail.com",
        },
        notes: {
            description: "Best Course for SDE placements",
            language: `Available in 4 major Languages JAVA, 
                            C/C++, Python, Javascript`,
            access: "This course have Lifetime Access",
        },
        theme: {
            color: "#2300a3",
        },
     };
    var razorpayObject = new Razorpay(options);
    console.log("our razor pay ", razorpayObject);
    razorpayObject.on("payment.failed", function (response) {
    console.log(response);
    alert("This step of Payment Failed");
    });

    document.getElementById("pay-button").onclick = function (e) {
    razorpayObject.open();
    //   alert("open our razor pay");
    e.preventDefault();
    };

