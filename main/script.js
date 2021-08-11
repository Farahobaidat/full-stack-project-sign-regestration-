window.onload = checkUser;

function checkUser(){
    if(localStorage.getItem("token")){
        window.location.href ="./index.html";
    }
    else{
        window.location.href = "../signin /index.html";
    }
}