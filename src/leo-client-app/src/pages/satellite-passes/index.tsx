"use client";

import SatelliteInfo from "@/components/SatelliteInfo";
import FuturePasses from "@/components/FuturePasses";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { Stack } from "@mui/material";
import Navbar from "@/components/navbar/Navbar";
import SatelliteTLE from "@/components/SatelliteTLE";
import React, { useState } from "react";

const defaultNoradId = "55098";

function SatelliteInfoPage() {
  const [isLoading, setIsLoading] = useState(false);

  const [selectedNoradId, setSelectedNoradId] =
    useState<string>(defaultNoradId);

  return (
    <main>
      <Navbar />
      <Stack spacing={3} alignItems="center" p={2}>
        <SatelliteTLE
          noradId={selectedNoradId}
          setNoradId={setSelectedNoradId}
        />
        <SatelliteInfo noradId={selectedNoradId} />
        <FuturePasses noradId={selectedNoradId} />
      </Stack>
    </main>
  );
}

export default withPageAuthRequired(SatelliteInfoPage);
