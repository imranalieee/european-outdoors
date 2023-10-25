import React from 'react';
import ReactToPrint from 'react-to-print';
import PrintableTable from './printPickSheet';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.tableRef = React.createRef();
  }

  render() {
    const data = [
      { id: 1, name: 'John', age: 25 },
      { id: 2, name: 'Jane', age: 30 },
      { id: 3, name: 'Bob', age: 28 }
    ];

    return (
      <div className="App">
        <PrintableTable data={data} ref={this.tableRef} />
        <ReactToPrint
          trigger={() => <PrintButton onClick={() => this.tableRef.current.onPrint()} />}
          content={() => this.tableRef.current}
        />
      </div>
    );
  }
}

export default App;
