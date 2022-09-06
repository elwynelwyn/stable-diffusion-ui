import React, {useEffect, useState}from "react";

import { useQuery } from "@tanstack/react-query";
import { useImageCreate } from "../../../store/imageCreateStore";
import { useImageDisplay } from "../../../store/imageDisplayStore";
import { doMakeImage } from "../../../api"; 

export default function MakeButton() {

  const imageOptions = useImageCreate((state) => state.imageOptions);
  const addNewImage = useImageDisplay((state) => state.addNewImage);
  
  // use this cache in the future since the options can change.
  const [cachedOptions, setCachedOptions] = useState({});

  const { status, data, refetch } = useQuery(['makeImage', imageOptions], () => doMakeImage(imageOptions), {
    refetchOnWindowFocus: false,
    enabled: false // disable this query from automatically running
  });

  const makeImage = async () => {
    console.log("makeImage");
    debugger;
    setCachedOptions(imageOptions);
    refetch();
  };

  useEffect(() => {
    console.log('MakeButton: status', status);
    console.log('MakeButton: data', data);
    // query is done
    if(status === 'success') {
      // check to make sure that the image was created
      if(data.status === 'succeeded') {
        debugger
        data.output.forEach((image) => {
          addNewImage(image.data,imageOptions);
        });
      }
    }

  }, [status, data, imageOptions]);

  return (
     <button onClick={makeImage}>Make</button>
  );
}