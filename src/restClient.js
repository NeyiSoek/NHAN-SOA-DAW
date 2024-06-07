import axios from 'axios';

const getProduct = async (id) => {
  try {
    const response = await axios.get(`http://localhost:4000/api/product/${id}`);
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching product data:', error);
  }
};

// Llamar al cliente con un ID de ejemplo
getProduct(1);
