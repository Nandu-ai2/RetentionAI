import UploadBox from "../components/UploadBox";

const handleFileSelect = (file) => {
  console.log(file);
};

<UploadBox
  onFileSelect={handleFileSelect}
/>