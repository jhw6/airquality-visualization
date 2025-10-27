<template>
    <div class="login-page">
        <div class="login-container">
            <div class="flex justify-center">
                <img src="@/assets/images/logo.png" alt="logo" class="w-8 h-8 mr-1" />
                <h1 class="title">混凝土放热量与绝热温升计算助手</h1>
            </div>
            <p class="subtitle"></p>
            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label for="username">用户名</label>
                    <input
                        type="text"
                        id="username"
                        v-model="username"
                        placeholder="请输入用户名"
                        required
                    />
                </div>
                <div class="form-group">
                    <label for="password">密码</label>
                    <input
                        type="password"
                        id="password"
                        v-model="password"
                        placeholder="请输入密码"
                        required
                    />
                </div>
                <button type="submit" class="login-button">登录</button>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            username: '',
            password: '',
        };
    },
    methods: {
        handleLogin() {
            if (this.username=='admin' && this.password == 'admin') {
                // alert(`欢迎回来!`);
                this.$router.push('/home');
            } else {
                alert('用户名或密码错误');
                return;
            }
        },
    },
};
</script>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #0b0b0bec;
  font-size: 20px;
  white-space: nowrap;
}
.login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    /* background: url('../images/登录面板.png') no-repeat center center fixed; */
    background-size: cover;
    font-family: 'Arial', sans-serif;
}

.login-container {
    background-color:white ;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    text-align: center;
    width: 100%;
    max-width: 400px;
}

.title {
    font-size: 24px;
    font-weight: 700;
    color: #000000;
    margin-bottom: 0.5rem;
}

.subtitle {
    font-size: 1rem;
    color: #000000;
    margin-bottom: 1.5rem;
}

.form-group {
    margin-bottom: 1rem;
    text-align: left;
}

label {
    display: block;
    font-size: 0.9rem;
    color: #000000;
    margin-bottom: 0.5rem;
}

input {
    width: 100%;
    padding: 0.8rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
    color: #7d7d7d;
}

input:focus {
    outline: none;
    border-color: #2575fc;
    box-shadow: 0 0 5px rgba(37, 117, 252, 0.5);
}

.login-button {
    margin-top:20px;
    width: 100%;
    padding: 0.8rem;
    font-size: 1rem;
    color: #fff;
    background: #2575fc;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.login-button:hover {
    background: #1a5bb8;
}
</style>