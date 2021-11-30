import StackableContainer from "../layout/StackableContainer";

const MultisigHoldings = (props) => {
  const basecroToCro = (basecro) => {
    if (basecro === 0) return 0;
    return basecro / 100000000;
  };

  return (
    <StackableContainer lessPadding fullHeight>
      <h2>Holdings</h2>
      <StackableContainer lessPadding lessMargin>
        <span>{props.holdings} CRO</span>
      </StackableContainer>
      <style jsx>{`
        span {
          text-align: center;
        }
      `}</style>
    </StackableContainer>
  );
};
export default MultisigHoldings;
