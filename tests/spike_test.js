import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '15s', target: 50 },
        { duration: '10s', target: 200 },
        { duration: '10s', target: 200 },
        { duration: '15s', target: 50 },
        { duration: '20s', target: 50 },
    ],
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