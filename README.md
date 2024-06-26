# MCT: A Command Scheduling Application for Mission Operation and Control (MOC) of the McMaster PRESET CubeSat

Developer Names:

- Quinn Ha
- Rishi Vaya
- Umang Rajkarnikar
- Dhruv Cheemakurti
- Diamond Ahuja

Date of project start: Sept 5 2023

This project is an automatic satellite tracker and command scheduler for the McMaster Interdisciplinary Satellite Team (MIST).

The folders and files for this project are as follows:

`docs` - Capstone documentation for this project

`refs` - Project proposal document from MIST

`src` - Source code

`src/docs` - Project documentation, including endpoint information, and database schemas

`src/leo-client-app` - Client
(front end) application of source code

`src/leo-server-app` - Server (back end) application of source code

Tests are located in each sub-repository. Integration tests will be availible in the `tests`

## Background

McMaster Interdisciplinary Satellite Team (MIST) launched its first-ever satellite, the NEUDOSE CubeSat, in March 2023. To communicate and command the satellite, a permanent ground station (GS) has been set up on the campus of McMaster University (43.2585° N, 79.9201° W). For radio frequency (RF) signals to reach each other, the satellite must be orbiting above the GS horizon, or 0° elevation. Higher elevation means shorter distances, stronger signals, and less noise. Although NEUDOSE will orbit the earth up to 16 times per day, it will only pass over the Hamilton sky 3-5 times during that day. Often, these overpasses are not ideal because their maximum elevations are far from the center of the sky, where
the signals are the strongest. Operators use orbital prediction software such as Gpredict, N2YO, GMAT, and PyOrbital to find overpasses in the future. For each suitable pass, an operator will wait until just
before the Acquisition of Signal (AOS, i.e. going above 0° elevation), log into the mission control computer, launch software for RF communications, send the satellite commands, wait for responses, and finally closeout operation by the Loss of Signal (LOS, i.e. going under 0° elevation).

During the Launch and Early Operations (LEOP) phase of NEUDOSE, this approach proved to be problematic. Operators were not available during suitable passes, which can happen at midnight, early morning, or the middle of the day. Launching software and entering commands were mundane and error-prone for a human operator. Command history was not saved under Configuration Management (CM), making it difficult to trace the current system state. The Flight Model (FM) and the Engineering Model (EM) had separated software interfaces, resulting in inconsistent system verification and operator training. Finally, access control was difficult to manage with a single password-protected computer.

Work is underway at MIST to develop a second CubeSat named PRESET. Deployed to a sun-synchronous orbit (SSO), PRESET will study the dynamics of electrons in the magnetosphere. The mission is currently in the Concept Design (MCR) phase and will be ready for launch in 2025. The amount of data generated by the science instrument will increase, while the number of access windows will decrease due to the change in orbit. For all the above reasons, it will be crucial to have mission operation software that is efficient, robust, flexible, and easy to use.
