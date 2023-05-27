
//注册、登录
// 要操作到的元素
let login=document.getElementById('btn_login');
let register=document.getElementById('btn_register');
let form_box=document.getElementsByClassName('form-box')[0];
let register_box=document.getElementsByClassName('register-box')[0];
let login_box=document.getElementsByClassName('login-box')[0];
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
