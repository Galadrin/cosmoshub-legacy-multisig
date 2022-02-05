import axios from "axios";
import { calculateFee } from "@cosmjs/stargate";
import { Decimal } from "@cosmjs/math";
import React, { useState } from "react";
import { withRouter } from "next/router";

import { useAppContext } from "../../context/AppContext";
import Button from "../../components/inputs/Button";
import Input from "../../components/inputs/Input";
import TextArea from "../inputs/TextArea";
import StackableContainer from "../layout/StackableContainer";
import { checkAddress, exampleAddress } from "../../lib/displayHelpers";

const TransactionForm = (props) => {
  const { state } = useAppContext();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("0");
  const [memo, setMemo] = useState("");
  const [gas, setGas] = useState(200000);
  const [gasPrice, _setGasPrice] = useState(state.chain.gasPrice);
  const [_processing, setProcessing] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [rawCustomTx, setRawCustomTx] = useState("");
  const [parsedCustomTx, setParsedCustomTx] = useState("");
  const [customError, setCustomError] = useState("");
  const [customValidMessage, setCustomValidMessage] = useState("");

  const createTransaction = (txToAddress, txAmount, txGas) => {
    const amountInAtomics = Decimal.fromUserInput(
      txAmount,
      Number(state.chain.displayDenomExponent),
    ).atomics;
    const msgSend = {
      fromAddress: props.address,
      toAddress: txToAddress,
      amount: [
        {
          amount: amountInAtomics,
          denom: state.chain.denom,
        },
      ],
    };
    const msg = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: msgSend,
    };
    const fee = calculateFee(Number(txGas), gasPrice);
    return {
      accountNumber: props.accountOnChain.accountNumber,
      sequence: props.accountOnChain.sequence,
      chainId: state.chain.chainId,
      msgs: [msg],
      fee: fee,
      memo: memo,
    };
  };

  const parseCustomTx = (rawCustomTx) => {
    try {
      const parsedTX = JSON.parse(rawCustomTx);
      setCustomError("");
      setParsedCustomTx(parsedTX);
      setCustomValidMessage("Valid JSON");
    } catch (err) {
      console.log(err);
      setCustomError("Not valid JSON");
      setCustomValidMessage("");
    }
  };

  const handleCreate = async () => {
    setProcessing(true);
    
    let dataJSON  = ""
    if (props.isCustomTx) {
      dataJSON  = JSON.stringify(parsedCustomTx);
    } else {
      const toAddressError = checkAddress(toAddress, state.chain.addressPrefix);
      if (toAddressError) {
        setAddressError(`Invalid address for network ${state.chain.chainId}: ${toAddressError}`);
        return;
      }
      const tx = createTransaction(toAddress, amount, gas);
      console.log(tx);
      dataJSON = JSON.stringify(tx);
    }
    const res = await axios.post("/api/transaction", { dataJSON });
    const { transactionID } = res.data;
    props.router.push(`${props.address}/transaction/${transactionID}`);
  };

    return (
      <StackableContainer lessPadding>
      <button className="remove" onClick={() => props.closeForm()}>
          ✕
        </button>
        <h2>
          {props.isCustomTx ? "Create Custom Transaction" : "Send Funds"}
        </h2>
        {props.isCustomTx ? (
          <>
            <StackableContainer lessPadding lessMargin>
              <p>
                Paste in the JSON for the custom transaction below. Only proceed
                if you know exactly what you are doing.
              </p>
            </StackableContainer>
            <div className="form-item">
              <TextArea
                label="Transaction JSON"
                name="rawCustomTx"
                value={rawCustomTx}
                onChange={(e) => setRawCustomTx(e.target.value)}
                error={addressError}
                placeholder=""
                error={customError}
                onBlur={(e) => parseCustomTx(e.target.value)}
                validMessage={customValidMessage}
              />
            </div>
          </>
        ) : (
          <>
        <div className="form-item">
          <Input
            label="To Address"
            name="toAddress"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          error={addressError}
          placeholder={`E.g. ${exampleAddress(0, state.chain.addressPrefix)}`}
          />
        </div>
        <div className="form-item">
          <Input
          label={`Amount (${state.chain.displayDenom})`}
            name="amount"
            type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="form-item">
          <Input
          label="Gas Limit"
            name="gas"
            type="number"
          value={gas}
          onChange={(e) => setGas(e.target.value)}
          />
        </div>
        <div className="form-item">
        <Input label="Gas Price" name="gas_price" type="string" value={gasPrice} disabled={true} />
      </div>
      <div className="form-item">
          <Input
            label="Memo"
            name="memo"
            type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          />
        </div>
          </>
        )}
      <Button label="Create Transaction" onClick={handleCreate} />
        <style jsx>{`
          p {
            margin-top: 15px;
          }
          .form-item {
            margin-top: 1.5em;
          }
          button.remove {
            background: rgba(255, 255, 255, 0.2);
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: none;
            color: white;
            position: absolute;
            right: 10px;
            top: 10px;
          }
        `}</style>
      </StackableContainer>
    );
};

export default withRouter(TransactionForm);
