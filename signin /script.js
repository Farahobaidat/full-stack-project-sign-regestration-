const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const signInBtn = document.getElementById("signInBtn");
let token = null;

signInBtn.addEventListener("click", (event) => {
    const option = {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            "email": `${emailInput.value}`,
            "password": `${passwordInput.value}`
        })
    };
      
    var foo = "bar";
      
    fetch(`http://localhost:2000/users/signin`,option)
    .then(response => {
    
        if (response.status == 500){
            console.error(false)
        }
        else if (response.status == 400){
            console.log("error email");
        }
        else if(response.status == 401){
            console.log("error password");
        }
        return response.text();
        })
    .then(result => {
        localStorage.token = result;
        console.log('token ',localStorage.getItem("token"));
        window.location.href = "../main/index.html";
    })
    
})

