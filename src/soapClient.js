import axios from 'axios';

const url = 'http://localhost:4000/wsdl/products';
const headers = {
  'Content-Type': 'text/xml;charset=UTF-8',
  'SOAPAction': 'http://www.example.com/inventory#getProduct',
};

const xml = `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:inv="http://www.example.com/inventory">
     <soapenv:Header/>
     <soapenv:Body>
        <inv:getProduct>
           <id>1</id>
        </inv:getProduct>
     </soapenv:Body>
  </soapenv:Envelope>
`;

async function getProduct() {
  try {
    const { data } = await axios.post(url, xml, { headers });
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error fetching product data:', error);
  }
}

getProduct();
