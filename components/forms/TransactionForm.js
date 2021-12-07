import axios from "axios";
import { coins } from "@cosmjs/launchpad";
import React from "react";
import { withRouter } from "next/router";

import Button from "../../components/inputs/Button";
import Input from "../../components/inputs/Input";
import StackableContainer from "../layout/StackableContainer";

let emptyMsgSendGroup = () => {
  return { toAddress: "", amount: "", keyError: "" };
};

class TransactionForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      txMsg: [emptyMsgSendGroup()],
      memo: "",
      gas: 500000,
      processing: false,
      addressError: "",
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };
  
  handleKeyGroupChange = (index, e) => {
    const { txMsg } = this.state;
    txMsg[index][e.target.name] = e.target.value;
    this.setState({ txMsg });
  };

  handleAddKey = () => {
    this.setState({ txMsg: this.state.txMsg.concat(emptyMsgSendGroup())});
  };

  handleCreate = async () => {
    this.setState({ processing: true });
    const tx = this.createTransaction(
      this.state.txMsg,
      this.state.gas
    );
    console.log(tx);
    const dataJSON = JSON.stringify(tx);
    const res = await axios.post("/api/transaction", { dataJSON });
    const { transactionID } = res.data;
    this.props.router.push(
      `${this.props.address}/transaction/${transactionID}`
    );
  };

  handleKeyBlur = async (index, e) => {
    let address = e.target.value;
  };

  createSendMessage = (toAddress, amount) => {
    const msgSend = {
      fromAddress: this.props.address,
      toAddress: toAddress,
      amount: coins(amount * 10**Number(process.env.NEXT_PUBLIC_DECIMAL), process.env.NEXT_PUBLIC_DENOM),
    };
    return {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: msgSend,
    };
  };

  createTransaction = (msgList, gas) => {
    const gasLimit = gas;
    const fee = {
      amount: coins(12500, process.env.NEXT_PUBLIC_DENOM),
      gas: gasLimit.toString(),
    };
    const messages = [];
    for (let m of msgList){
      messages.push(this.createSendMessage(m.toAddress, m.amount));
    }

    return {
      accountNumber: this.props.accountOnChain.accountNumber,
      sequence: this.props.accountOnChain.sequence,
      chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
      msgs: messages,
      fee: fee,
      memo: this.state.memo,
    };
  };

  render() {
    return (
      <>
        <StackableContainer>
            <StackableContainer lessPadding>
              <p>Add the addresses that will make up this multisig.</p>
            </StackableContainer>
            {this.state.txMsg.map((msgSendGroup, index) => (
              <StackableContainer lessPadding lessMargin key={index}>
                <div className="key-row">
                  {this.state.txMsg.length > 2 && (
                    <button
                      className="remove"
                      onClick={() => {
                        this.handleRemove(index);
                      }}
                    >
                      ✕
                    </button>
                  )}
                  <div className="form-item">
                    <Input
                      onChange={(e) => {
                        this.handleKeyGroupChange(index, e);
                      }}
                      value={msgSendGroup.toAddress}
                      label="Address"
                      name="toAddress"
                      width="100%"
                      placeholder="cro1...."
                      error={msgSendGroup.keyError}
                      onBlur={(e) => {
                        this.handleKeyBlur(index, e);
                      }}
                    />
                  </div>
                  <div className="form-item">
                    <Input
                      onChange={(e) => {
                        this.handleKeyGroupChange(index, e);
                      }}
                      value={msgSendGroup.amount}
                      label="Amount (CRO)"
                      name="amount"
                      width="100%"
                      placeholder="CRO"
                      error={msgSendGroup.keyError}
                      onBlur={(e) => {
                        this.handleKeyBlur(index, e);
                      }}
                    />
                  </div>
                </div>
              </StackableContainer>
            ))}

            <Button label="Add another address" onClick={this.handleAddKey} />
          </StackableContainer>

        <StackableContainer>

          <StackableContainer lessPadding lessMargin>
            <div className="form-item">
              <Input
                label="Gas Limit (basecro)"
                name="gas"
                type="number"
                value={this.state.gas}
                onChange={this.handleChange}
              />
            </div>
            <div className="form-item">
              <Input
                label="Memo"
                name="memo"
                type="text"
                value={this.state.memo}
                onChange={this.handleChange}
              />
            </div>
          </StackableContainer>
        </StackableContainer>
        <Button label="Create Transaction" onClick={this.handleCreate} />
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
      </>
    );
  }
}

export default withRouter(TransactionForm);