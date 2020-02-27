import axios from "axios";
import Web3 from "web3";

var web3 = new Web3(
  "https://mainnet.infura.io/v3/8d269c24ea1149049bc53db759bbc1a7"
);

const resolveAddress = address => {
  const matchers = {
    iov: name => /.*\*.+/.test(name),
    ens: name => /.+\.eth/.test(name),
    eth: name => web3.utils.isAddress(name),
  };

  for (let [service, matcher] of Object.entries(matchers)) {
    if (matcher(address)) {
      console.log(service);
      return resolvers[service](address);
    }
  }

  return "Invalid address";
};

const iovUrl = "https://iov-proxy.herokuapp.com/"; //"http://bnsapi.iov.one:8000/username/resolve/";
const resolvers = {
  iov: async address => {
    const { data } = await axios.get(`${iovUrl}${address}`);
    if (data && data.targets) {
      const addr = data.targets.find(
        target => target.blockchain_id === "ethereum-eip155-1"
      );
      if (addr.address) {
        return addr.address;
      }
    }

    return `No address registered for starname: ${address}`;
  },

  ens: async address => {
    return await web3.eth.ens.getAddress(address);
  },

  eth: address => Promise.resolve(address),
};

// ------------------

const payerField = document.getElementById("payer-field");
const payerInput = document.getElementById("payer");
const payerOutput = document.getElementById("payer-output");

const paymentField = document.getElementById("payment-field");
const paymentInput = document.getElementById("payment");
const paymentOutput = document.getElementById("payment-output");

const submitField = document.getElementById("submit-field");
const submit = document.getElementById("submit");
const dump = document.getElementById("dump");

// ------------------

let payer = "";

const checkPayer = async () => {
  payerField.classList.add("with-loader");
  payer = await resolveAddress(payerInput.value);
  if (payer === "0x0000000000000000000000000000000000000000") {
    payer = "address no set";
  }
  payerOutput.innerHTML = payer;
  payerField.classList.remove("with-loader");
};
payerInput.addEventListener("blur", checkPayer);
if (payerInput.value) {
  checkPayer();
}

let payment = "";

const checkPayment = async () => {
  paymentField.classList.add("with-loader");
  payment = await resolveAddress(paymentInput.value);
  if (payment === "0x0000000000000000000000000000000000000000") {
    payment = "address no set";
  }
  paymentOutput.innerHTML = payment;
  paymentField.classList.remove("with-loader");
};
paymentInput.addEventListener("blur", checkPayment);
if (paymentInput.value) {
  checkPayment();
}

submit.addEventListener("click", async () => {
  const amount = web3.utils.toWei(document.getElementById("amount").value);
  if (!amount) {
    alert("Invalid amount");
    return;
  }

  if (!web3.utils.isAddress(payer)) {
    alert("Invalid payer address");
    return;
  }

  if (!web3.utils.isAddress(payment)) {
    alert("Invalid payment address");
    return;
  }

  submitField.classList.add("with-loader");
  const request = await sendRequest(amount, payer, payment);
  if (request.data.requestId) {
    alert("Request created");
    dump.innerHTML = JSON.stringify(request.data, null, 2);
  } else {
    alert("Failed creating request");
    dump.innerHTML = JSON.stringify(request.data, null, 2);
  }
  submitField.classList.remove("with-loader");
});

const API_KEY = "5BZDB1W-NK14FAC-JEGHZ4X-58847YM";

const sendRequest = async (amount, payerAddress, paymentAddress) => {
  const requestParams = {
    currency: "ETH",
    expectedAmount: amount,
    payment: {
      type: "eth-input-data",
      value: paymentAddress,
    },
    payer: {
      type: "ethereumAddress",
      value: payerAddress,
    },
  };

  return await axios.post(
    "https://api.request.network/requests",
    requestParams,
    {
      headers: { Authorization: API_KEY },
    }
  );
};
