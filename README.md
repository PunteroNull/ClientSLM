# ClientSLM

Frontend del sistema de recomendaciones de temas y contenidos basados en Tweets de un usuario.

## Instalación
El proyecto necesita las siguientes tecnologias instaladas para su correcto funcionamiento:

* NodeJS (Version utilizada: v8.12.0)

### NodeJS

Hay diferentes alternativas para instalar NodeJS dependiendo el sistema operativo donde se quiera utilizar el sistema. Las diferentes descargas se encuentran en el siguiente enlace:

[Descargar NodeJS](https://nodejs.org/en/download/)

Ademas de los instaladores, existen otros metodos de instalación como por ejemplo el package manager del sistema operativo. Por ejemplo, en Debian/Ubuntu el metodo de instalacion es el siguiente:

```sh
# Ubuntu
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

# Debian
curl -sL https://deb.nodesource.com/setup_8.x | bash -
apt-get install -y nodejs
```

[Distribuciones binarias de NodeJS](https://github.com/nodesource/distributions/blob/master/README.md)

Al instalar NodeJS, tambien instalara NPM que se utilizara para instalar las dependencias del proyecto.

### Modulos npm

Antes de poder ejecutar el proyecto, debe instalar las dependencias del proyecto. Para eso, ejecute el siguiente comando de NPM (Si instalo correctamente NodeJS deberia tambien tener NPM):

```
npm install
```

## Configuración inicial

En el directorio raiz del sistema se encuentra un archivo **config.json** donde puede especificar en que puerto funcionara el sistema, por defecto lo hará en el puerto *7000*.

Si desea cambiar la direccion de la API del servidor, puede hacerlo en el archivo **/public/javascripts/appAngular.js** en la seccion *configuracionGlobal*.

## Funcionamiento del sistema

Para poder iniciar el sistema, ejecute el siguiente comando:

```
node bin/www.js
```

Si todo fue configurado correctamente, la API deberia estar corriendo en el puerto que previamente se configuro.