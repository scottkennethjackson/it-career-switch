const apiKey = 'nJsYKf2ucwmGmjUEyqwq9HMQgqo4w6ngNHiJsza4_h6D3ZqNaPEAOISpKRz7hEVtQLCUy_QBKYaUb472zCCHZRW0X_ZyOlIThlSYlcfcYaw_BnxjzMxp3n8C-MkyZHYx';

const Yelp = {
    search(term, location, sortBy) {
        return fetch(
            `https://corsanywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=${term}&location=${location}&sort_by=${sortBy}`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            }
        ).then(response => {
            return response.json();
        }).then(jsonResponse => {
            if (jsonResponse.businesses) {
                return jsonResponse.businesses.map(business => ({
                    id: business.id,
                    imageSrc: business.image_url,
                    name: business.name,
                    address: business.location.address1,
                    city: business.location.city,
                    state: business.location.state,
                    zipCode: business.location.zip_code,
                    category: business.categories[0].title,
                    rating: business.rating,
                    reviewCount: business.review_count
                }));
            }
        });
    }
};

export default Yelp;