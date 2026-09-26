import { PUBLIC_API_BASE_URL } from '$env/static/public';

const API_BASE_URL = PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export function apiRequest(){
    console.log(API_BASE_URL);
}