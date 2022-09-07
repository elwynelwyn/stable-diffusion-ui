import React, {useEffect, useState}from "react";

import { useImageCreate } from "../../../store/imageCreateStore";
// import { useImageDisplay } from "../../../store/imageDisplayStore";
import { useImageQueue } from "../../../store/imageQueueStore"; 
// import { doMakeImage } from "../../../api"; 
import {v4 as uuidv4} from 'uuid';

export default function MakeButton() {

  // const [queryId , setQueryId] = useState(uuidv4());
  const imageOptions = useImageCreate((state) => state.imageOptions);
  const addNewImage = useImageQueue((state) => state.addNewImage);
  
  // // use this cache in the future since the options can change.
  // const [cachedOptions, setCachedOptions] = useState({});

  // const { status, data, refetch } = useQuery(['makeImage', imageOptions], () => doMakeImage(imageOptions), {
  //   enabled: false // disable this query from automatically running
  // });

  const makeImage = () => {
    addNewImage(uuidv4(), imageOptions)
    // console.log("makeImage");
    // setCachedOptions(imageOptions);
    // refetch();
    // setQueryId(uuidv4());
  };

  // useEffect(() => {
  //   console.log("Make image useEffect");
  //   // query is done
  //   if(status === 'success') {
  //     console.log("success");

  //     // check to make sure that the image was created
  //     if(data.status === 'succeeded') {
  //       console.log("succeeded");
  //       debugger;
  //       data.output.forEach((image) => {
  //         console.log("addNewImage");
  //         addNewImage(image.data,imageOptions);
  //       });
  //     }
  //   }

  // }, [status, data, imageOptions]);

  return (
     <button onClick={makeImage}>Make</button>
  );
}