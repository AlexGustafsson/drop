import React from "react";

import Dropper from "./components/dropper";
import DroppedFile from "./components/dropped-file";

type AppProps = {
  maximumFileCount: number,
  maximumFileSize: number,
  maximumSize: number,
};

type AppState = {
  files: File[]
};

export default class App extends React.Component<AppProps, AppState> {
  state: AppState = {
    files: [],
  };

  constructor(props: AppProps) {
    super(props);

    this.filesChanged = this.filesChanged.bind(this);
  }

  filesChanged(files: File[]) {
    this.setState({
      files,
    });
  }

  render() {
    const files = this.state.files.map(file => {
      return <DroppedFile key="a" title="boo" uploadProgress={0.5} encryptionProgress={0.75} />
    });

    return <main id="main">
      <h1>Upload your files</h1>
      <h2>Any files are supported, but large files may take longer to process</h2>
      <Dropper onChange={this.filesChanged} maximumFileCount={this.props.maximumFileCount} maximumFileSize={this.props.maximumFileSize} maximumSize={this.props.maximumSize}/>
      <div id="file-scroller">
        <ul id="files">
          {files}
        </ul>
      </div>
    </main>
  }
}
