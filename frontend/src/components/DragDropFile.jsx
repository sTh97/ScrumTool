import { useCallback, useState } from 'react';

export default function DragDropFile({ onFiles }) {
  const [hover, setHover] = useState(false);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setHover(false);
    const files = Array.from(e.dataTransfer.files || []);
    onFiles && onFiles(files);
  },[onFiles]);

  return (
    <div
      onDragOver={(e)=>{e.preventDefault(); setHover(true);}}
      onDragLeave={()=>setHover(false)}
      onDrop={onDrop}
      className={`border-2 border-dashed rounded-xl p-6 text-center ${hover ? 'border-black bg-gray-50' : 'border-gray-300'}`}
    >
      <p className="text-sm text-gray-600">Drag & drop files here, or click to select</p>
      <input type="file" multiple className="hidden" id="filePick" onChange={e=>onFiles && onFiles(Array.from(e.target.files||[]))}/>
      <label htmlFor="filePick" className="inline-block mt-3 px-4 py-2 bg-black text-white rounded-xl cursor-pointer">Choose Files</label>
    </div>
  );
}
