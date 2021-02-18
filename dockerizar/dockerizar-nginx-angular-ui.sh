#!/bin/bash
# ------------------------------------------------------------------
# [jseluy]  SCRIPT PARA DOCKER
#           Creación de la imagen con nombre y versión automáticos.
#           Subida de la imagen al Registry de Carsa.
# ------------------------------------------------------------------

VERSION=5.1.0
USAGE="Uso:\t./dockerizar-nginx-angular.sh"

# ------------------------------------------------------------------

regla='^[a-z0-9_-]{5,}:v[0-9]+\.[0-9]+\.?[0-9]*$'
reglaPuerto='^83[0-9]{2}$'
registry=10.4.101.158:5000
rutaDockerfile=.
puertoDefecto=80
ipDocker="$(docker-machine ip)"

# ------------------------------------------------------------------


# Compruebo el ambiente
case $1 in
  dev|qa|prd)
    ENV=$1
    ;;

  prd)
    ENV="prd"
    ;;

  *)
    printf "\n\tUso: $0 {dev|qa|prd}\n"
    exit 1

esac


# Extraigo nombre y versión del archivo package.json #
nombre="$(grep -Po '(?<=\"name\": \")[^\"]*' package.json)"
version="$(grep -Po '(?<=\"version\": \")[^\"]*' package.json)"

# Compongo el nombre de la imagen con el formato preestablecido
imagen=$nombre-$ENV:v$version



# Solicito al usuario que valide el nombre del proyecto
echo    # move to a new line
read -p "Indique si es correcto ( $imagen ) [s/n]: " -n 1 respuesta
echo    # move to a new line

if [[ ! $respuesta =~ ^[SsYy]$ ]]
then

    printf "\n>>>\tConfigure los valores correctos en el archivo « package.json ».\n"
    printf "\nEl proceso fue abortado.\n\n"
    exit 1

fi



### Dockerfile ###
rm $rutaDockerfile/Dockerfile
# Creo el archivo
touch $rutaDockerfile/Dockerfile

# Cargo el archivo con el contenido
echo "FROM nginx" > $rutaDockerfile/Dockerfile && echo '' >> $rutaDockerfile/Dockerfile

echo "# Copio los archivos de la aplicación" >> $rutaDockerfile/Dockerfile
echo "COPY nginx-$ENV.conf /etc/nginx/nginx.conf" >> $rutaDockerfile/Dockerfile
echo "COPY www /etc/nginx/html" >> $rutaDockerfile/Dockerfile && echo '' >> $rutaDockerfile/Dockerfile

echo '# Expongo el puerto por defecto' >> $rutaDockerfile/Dockerfile
echo "EXPOSE $puertoDefecto" >> $rutaDockerfile/Dockerfile

printf "\n¡Dockerfile creado exitosamente!\n\n"

#-- FIN Dockerfile --#



# Contruyo el proyecto (build)
#printf "\n\nConstrucción del proyecto ...\t"
#ionic build browser --prd

printf "\n\nComenzando construcción de la imagen ...\t"
date +"%T"
printf "\n\n"

echo    # move to a new line
docker build -t $imagen $rutaDockerfile

# Compruebo si se ejecutó docker build SIN ERRORES
return_val=$?

if [ ! "$return_val" -eq 0 ]; then
	printf "\ndocker build\tERROR\n\n"
  exit 1
else
	printf "\ndocker build\tOK\n\n"
fi

# Imprimo la hora
date +"%n%n%T%n%n"


######## Ejecuto localmente el contenedor

# Elimino el contenedor previo
printf "\nEliminando contenedor previo ...\n\n"
docker stop $nombre-$ENV
docker rm $nombre-$ENV

# Ejecuto el contenedor
printf "\n\nLevantando contenedor para $imagen ...\n\n"
docker run -di --name $nombre-$ENV -p $puertoDefecto:$puertoDefecto $imagen

printf "\nContenedor corriendo en $ipDocker:$puertoDefecto\n\n"


######## Envío la imagen al Resgitry

# Se ingresa al regisrty de Carsa
docker login -u dockeruser -p dockerpass $registry

# Se procede con la creación del TAG
docker tag $imagen $registry/$imagen
printf "\nTAG creado en\t$registry\n\n"

# Se manda el TAG al registry de Carsa
docker push $registry/$imagen

echo    # move to a new line

docker logout $registry


# Imprimo la hora
date +"%n%n%T%n%n"


# FIN
