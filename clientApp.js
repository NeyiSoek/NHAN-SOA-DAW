import axios from 'axios';
import soap from 'soap';

// URL del servicio SOAP
const soapUrl = 'http://localhost:4000/wsdl?wsdl';
// URL del servicio REST
const restUrl = 'http://localhost:4000/api/products';

// Consumir el servicio REST para obtener todos los productos
async function getProducts() {
  try {
    const response = await axios.get(restUrl);
    console.log('Productos:', response.data);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

// Consumir el servicio SOAP para actualizar un producto
async function updateProduct(productId, price, stock) {
  try {
    const client = await soap.createClientAsync(soapUrl);
    const result = await client.updateProductAsync({ id: productId, price, stock });
    console.log('Resultado de actualizar producto:', result);
  } catch (error) {
    console.error('Error updating product:', error);
  }
}

// Ejemplo de uso
//Metodo de Rest para obtener el producto
getProducts();

//Metodo de SOAP para modificar atributos del producto
updateProduct(1, 199.99, 50);
