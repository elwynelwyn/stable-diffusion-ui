import React, {useEffect} from "react";

import { useQuery } from "@tanstack/react-query";
import { loadModifications } from "../../../api";

export default function ImageModifers() {
  const {status, data} = useQuery(["modifications"], loadModifications);
  useEffect(() => {
    console.log('modification data', data);
  }, [data]);

  return <div>Image Modifiers</div>;
}