import React from "react";

import {SVG as FileIcon} from "../assets/file-icon.svg";

type DroppedFileProps = {
  title: string,
  uploadProgress: number,
  encryptionProgress: number,
};

export default class DroppedFile extends React.Component<DroppedFileProps> {
  render() {
    return <li className="grid grid-rows-2 grid-cols-triple h-16">
      <FileIcon className="w-14 row-span-full animate-move-in animation-delay-2 text-primary" />
      <p className="col-start-2 animate-move-in animation-delay-4">{this.props.title}</p>
      <p className="col-start-3 animate-move-in text-right animation-delay-6">{Math.round(this.props.uploadProgress * 100)}%</p>
      <div className="relative row-span-2 col-start-2 col-span-2 bg-gray-50 h-3 w-full rounded-md animate-fade-in animation-delay-8">
        <div className="absolute h-3 rounded-md bg-secondary transition-all" style={{ width: 0.5 * 100 }}></div>
        <div className="absolute h-3 rounded-md bg-primary transition-all" style={{width: 0.2 * 100}}></div>
      </div>
    </li>
  }
}

// .dropped - file {
//   display: grid;
//   grid - template - rows: 30px 30px;
//   grid - template - columns: 50px 1fr 50px;
//   grid - gap: 10px;
//   height: 70px;
//   overflow: hidden;
// }

// .dropped - file.icon {
//   grid - column: 1;
//   grid - row: 1 / 2;
//   width: 60px;
//   height: 60px;
//   color: #498CF9;

//   opacity: 0;
//   animation: move -in 0.5s forwards;
//   animation - delay: 0.2s;
// }

// .dropped - file.title {
//   grid - column: 2;
//   grid - row: 1;
//   align - self: flex - end;

//   opacity: 0;
//   animation: move -in 0.5s forwards;
//   animation - delay: 0.4s;
// }

// .dropped - file.status {
//   grid - column: 3;
//   grid - row: 1;
//   align - self: flex - end;
//   text - align: right;

//   opacity: 0;
//   animation: move -in 0.5s forwards;
//   animation - delay: 0.6s;
// }

// .dropped - file.progress {
//   position: relative;
//   grid - column: 2 / 4;
//   grid - row: 2;
//   width: 100 %;
//   background - color: #F4F8FD;
//   border - radius: 5px;
//   height: 10px;
//   align - self: flex - start;

//   opacity: 0;
//   animation: fade -in 0.5s forwards;
//   animation - delay: 0.8s;
// }

// .dropped - file.progress > .upload {
//   position: absolute;
//   top: 0;
//   left: 0;
//   display: block;
//   background - color: #498CF9;
//   border - radius: 5px;
//   height: 10px;
//   width: 0 %;
//   transition: 0.2s linear width;
//   z - index: 2;
// }

// .dropped - file.progress > .encrypt {
//   position: absolute;
//   top: 0;
//   left: 0;
//   display: block;
//   background - color: #f9b649;
//   border - radius: 5px;
//   height: 10px;
//   width: 0 %;
//   transition: 0.2s linear width;
//   z - index: 1;
// }

// @keyframes move -in {
//   0% {
//     opacity: 0;
//     transform: translateY(25 %);
//   }
//   100% {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }

// @keyframes fade -in {
//   0% {
//     opacity: 0;
//   }
//   100% {
//     opacity: 1;
//   }
// }
