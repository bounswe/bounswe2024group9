<h1 align = "center"> <img src= "https://github.com/bounswe/bounswe2024group9/assets/110239708/cfe28590-0739-4c58-8740-45e27c0a443b" width= 300px height=auto> </h1>

<h1 align = "center"> Welcome to CMPE352 Group 9's Project Repository </h1> 
💭 Hi! This is Group9 of Cmpe352. We are passionate computer engineer students gathered to create a sustainable working environment for complete project design of our future products. You can visit <a href = "https://github.com/bounswe/bounswe2024group9/wiki" target = "_blank">our Wiki web page</a> to get to know us!
<br>
<hr>
<h3> 🚀  Who are we? </h3> 
<table>
  <tr>
    <td align = "center">
      <img src = "https://github.com/berkaykeskino/REVERSE/blob/main/Photos/CeylinB.jpeg?raw=true" width = 80px>
      <p align = "center"> <a href = "https://github.com/bounswe/bounswe2024group9/wiki/Ceylin-Gebes#introduction" target = "_blank">Ceylin</a></p>
    </td>
    <td align = "center">
      <img src = "https://github.com/berkaykeskino/REVERSE/blob/main/Photos/BerkayB2.jpeg?raw=true" width = 80px>
      <p align = "center"><a href = "https://github.com/bounswe/bounswe2024group9/wiki/Muhammet-Berkay-Keskin#introduction" target = "_blank">Berkay</a></p>
    </td>
    <td align = "center">
      <img src = "https://github.com/berkaykeskino/REVERSE/blob/main/Photos/MustafaB.jpeg?raw=true" width = 80px>
      <p align = "center"><a href = "https://github.com/bounswe/bounswe2024group9/wiki/Mustafa-Atak#who-am-i-for-real" target = "_blank">Mustafa</a></p>
    </td>
    <td align = "center">
      <img src = "https://github.com/berkaykeskino/REVERSE/blob/main/Photos/KristinaB.jpeg?raw=true" width = 80px>
      <p align = "center"><a href = "https://github.com/bounswe/bounswe2024group9/wiki/Kristina-Trajkovski" target = "_blank">Kristina</a></p>
    </td>
    <td align = "center">
      <img src = "https://github.com/berkaykeskino/REVERSE/blob/main/Photos/emin.JPG?raw=true" width = 80px>
      <p align = "center"><a href = "https://github.com/bounswe/bounswe2024group9/wiki/Mehmet-Emin-%C4%B0pekdal" target = "_blank">Emin</a></p>
    </td>
    <td align = "center">
      <img src = "https://github.com/berkaykeskino/REVERSE/blob/main/Photos/eray.jpeg?raw=true" width = 80px>
      <p align = "center"><a href = "https://github.com/bounswe/bounswe2024group9/wiki/Eray-Ero%C4%9Flu" target = "_blank">Eray</a></p>
    </td>
    <td align = "center">
      <img src = "https://github.com/berkaykeskino/REVERSE/blob/main/Photos/ozgur.jpg?raw=true" width = 80px>
      <p align = "center"><a href = "https://github.com/bounswe/bounswe2024group9/wiki/%C3%96zg%C3%BCr-%C3%96zerdem" target = "_blank">Özgür</a></p>
    </td>

  </tr>
  <tr>
    <td align = "center">
      <img src = "https://github.com/berkaykeskino/REVERSE/blob/main/Photos/taha.jpg?raw=true" width = 80px>
      <p align = "center"><a href = "https://github.com/bounswe/bounswe2024group9/wiki/Taha-Topalo%C4%9Flu" target = "_blank">Taha</a></p>
    </td>
    <td align = "center">
      <img src = "https://github.com/berkaykeskino/REVERSE/blob/main/Photos/Yi%C4%9FitB.jpeg?raw=true" width = 80px>
      <p align = "center"><a href = "https://github.com/bounswe/bounswe2024group9/wiki/Yigit-Kagan-Poyrazoglu" target = "_blank">Yiğit Kağan</a></p>
    </td>
    <td align = "center">
      <img src = "https://github.com/bounswe/bounswe2024group9/assets/73756179/d5d3450e-8782-45cf-bb0c-a52d7c93f42e" width = 80px>
      <p align = "center"><a href = "https://github.com/bounswe/bounswe2024group9/wiki/Halil-Karabacak" target = "_blank">Halil</a></p>
    </td>
    <td align = "center">
      <img src = "https://th.bing.com/th/id/OIP.K0bqeBV-HC14rIqEiVH5RwAAAA?w=200&h=200&rs=1&pid=ImgDetMain" width = 80px>
      <p align = "center"><a href = "https://github.com/bounswe/bounswe2024group9/wiki/Ahmet-Burak-%C3%87i%C3%A7ek" target = "_blank">Burak</a></p>
    </td>
  </tr>
  
</table>

# BuRoute

## Dependencies
You must have

> docker 
> docker-compose

installed on your host (explained below). If not, you can download from [the official docker website.](https://www.docker.com/products/docker-desktop/) For ease of use, we suggest installing Docker Desktop; Docker Compose is included therein. 

## Accessing the Web Page

You can access the webpage [from here](http://165.22.125.216:3000).

## Deploying the server

#### Security Notice

As this is a classroom setting, database security is not as tight as a production environment; thus, database and web services run on the same computer.

#### Pull from Docker Hub

You can pull the project from Docker Hub:



#### Manual Deployment

First, make sure that Docker and Docker Compose are installed on your host machine. If not, you can:
    - Download Docker Desktop (recommended if host has a GUI)
    - Use the following official script:
    ```
    curl -fsSL https://get.docker.com -o get-docker.sh
    ```
    ```
    sh get-docker.sh
    ```
    
After Docker & Docker Compose are installed on the host machine, you should clone the repository:
```
git clone https://github.com/bounswe/bounswe2024group9.git
cd bounswe2024group9
```
Then, for the next step, you must register the IP Address of the host.
* You must modify the docker-compose.yml file: Set the environment variable at the web services to your host.
```
services:
    ...
    web:
        ...
        environment:
            - REACT_APP_API_URL=http://<ip_of_the_host>
```
* You must add the host IP address to ```ALLOWED_HOSTS = []``` variable at wiki_database_API/wikidata_django_practice/settings.py.

For the penultimate step, you need to set the environment variables: simply change the name of ```.env.example``` under ```wiki_database_API``` to ```.env```.

Now, you can deploy the service using Docker Compose:
``` 
docker compose build
docker compose up 
```



