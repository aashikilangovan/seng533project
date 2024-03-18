import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '15s', target: 150 }, // Ramp up to 50 users
        { duration: '30s', target: 150 }, // Stay at 50 users
        { duration: '15s', target: 0 },  // Ramp down to 0 users
    ],
    thresholds: {
        'http_req_duration': ['p(95)<500'], // 95% of requests should be below 500ms
    },
};

function browseProducts() {
    // Generate a random category ID between 2 and 6
    let categoryId = Math.floor(Math.random() * (6 - 2 + 1)) + 2;

    let url = `http://host.docker.internal:8080/tools.descartes.teastore.webui/category?category=${categoryId}&page=1`;
    let browseResponse = http.get(url);

    check(browseResponse, { 'browse status was 200': (r) => r.status === 200 });
}

function addToCart() {
    let productId = Math.floor(Math.random() * (426 - 7 + 1)) + 7;
    let quantity = Math.floor(Math.random() * (5 - 1 + 1)) + 1;

    let payload = {
        productId: productId,
        quantity: quantity
    };
    
    let params = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };

    // Convert payload object to URL-encoded string
    let encodedPayload = Object.keys(payload).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(payload[key]);
    }).join('&');

    let addCartResponse = http.post(
        'http://host.docker.internal:8080/tools.descartes.teastore.webui/cartAction', 
        encodedPayload, 
        params
    );

    check(addCartResponse, { 'add to cart was successful': (r) => r.status === 200 });
}

export default function () {
    browseProducts();
    addToCart();
    sleep(1);
}