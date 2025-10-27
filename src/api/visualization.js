import request from '@/utils/request.js';

export const getVisualizationData = () => {
    return request.get('/api/airquality');
}

export const getAirQualityData = (dbName) => {
    return request.get('/api/airquality/'+dbName,{ timeout: 60000 });
}

export const askDeepseek=(message)=>{
    return request.post('/api/ask_vector_db',{message:message}, { timeout: 60000 });
}