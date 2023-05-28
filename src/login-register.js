
//注册、登录
// 要操作到的元素
let login=document.getElementById('btn_login');
let register=document.getElementById('btn_register');
let form_box=document.getElementsByClassName('form-box')[0];
let register_box=document.getElementsByClassName('register-box')[0];
let login_box=document.getElementsByClassName('login-box')[0];
let username = document.getElementById('username');
let psd = document.getElementById('password');
let rpsd = document.getElementById('re_password');
// 去注册按钮点击事件
register.addEventListener('click',()=>{
    form_box.style.transform='translateX(90%)';
    login_box.classList.add('hidden');
    register_box.classList.remove('hidden');
})
// 去登录按钮点击事件
login.addEventListener('click',()=>{
    form_box.style.transform='translateX(0%)';
    register_box.classList.add('hidden');
    login_box.classList.remove('hidden');
})
function checkForm() {
    if (username.value == "") {
        username.style.border = "1px solid rgba(197,81,58,0.8)";
        alert("用户名不能为空！");
        return;
    } else {
        username.style.border = " 1px solid rgba(255,255,255,0.3)";
    }
    if (rpsd.value == '' || psd.value == '') {
        alert("密码不能为空！");
        return;
    }
    if (psd.value.length < 6) {
        alert("密码不能小于6位!");
        return;
    }
    if (rpsd.value == psd.value) {
        alert("注册成功！")
        btn_login.click();
    } else {
        alert("密码不一致！");
        rpsd.value = "";
    }
}
