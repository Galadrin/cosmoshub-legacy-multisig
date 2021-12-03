const DevHelper = (props) => (
  <div className="dev-helper">
    <h3>Dev Helper</h3>
    <h4>Pages</h4>
    <ul>
      <li>
        <a href="/">Index/Start</a>
      </li>
      <li>
        <a href="/create">Create Multisig</a>
      </li>
      <li>
        <a href="/multi/cro1tel9pm3g9mu3cl8d78d4z98fp5s9d5mvc8qcty">
          View Multisig
        </a>
      </li>
      <li>
        <a href="/multi/cro1tel9pm3g9mu3cl8d78d4z98fp5s9d5mvc8qcty/transaction/295630000375202310">
          View/Sign Transaction
        </a>
      </li>
    </ul>
    <a href="https://github.com/Galadrin/cosmoshub-legacy-multisig">
      View on Github
    </a>

    <style jsx>{`
      .dev-helper {
        position: fixed;
        bottom: 0;
        right: 0;
        background: #070e27;
        padding: 1em;
      }

      ul {
      }
      li {
        margin-bottom: 0.5em;
      }
      a {
        color: white;
      }
    `}</style>
  </div>
);

export default DevHelper;
