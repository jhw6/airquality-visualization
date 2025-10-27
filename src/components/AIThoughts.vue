<template>
    <div class="thoughtCard">
        <div class="font-bold">思考内容:</div>
        <div class="content">{{ props.thoughts }}</div>
    </div>
</template>

<script setup>
//属性参数
const props = defineProps({
    thoughts: {
        type: String,
        default: null
    }
});

</script>   
<style scoped>
.thoughtCard {
    width: 400px;
    height: 100%;
    padding: 10px;
    background-color: #f3f4f6;
    border-radius: 10px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    color:black;
}
.content {
    margin-top: 10px;
    font-size: 16px;
    max-height: 300px;
    overflow-y: auto;
}

</style>