import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/assets/panels/LoginPage.vue'; // 登录页面
import HomePage from '@/assets/panels/HomePage11.vue'; // 示例主页
// import HomePage from '@/assets/panels/radio.vue'; // 示例主页


const routes = [
    {
        path: '/',
        name: 'Login',
        component: LoginPage, // 登录页面
    },
    {
        path: '/home',
        name: 'Home',
        component: HomePage, // 示例主页
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;