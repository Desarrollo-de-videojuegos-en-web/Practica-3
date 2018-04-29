# Super Mario Bros

## 3.1 Carga del objeto Quintus

Inicializamos un objeto Quintus con un tamaño de 320x480 y añadimos los siguientes módulos:
 - Sprites
 - Scenes
 - Input
 - UI
 - Touch
 - TMX
 - Anim 
 - 2D
 - Audio
 
Además añadimos los formatos mp3 y ogg para el sonido y lo habilitamos con enableSound(), los controles con teclado y los eventos touch.

## 3.2 Carga del nivel TMX

Cargamos level1.tmx, una versión modificada del básico de la práctica donde añadimos tuberías y ampliamos el tamaño del nivel. Añadimos un componente viewport que solo sigue a Mario en el eje x y que para al llegar al final del nivel.

## 3.3 Mario en escena

Hemos creado una clase Mario que hereda de MovingSprite y le hemos añadido los componentes 2d, plataformerControls, animation y tween. Mario puede saltar al pulsa la tecla de dirección 'up' y también puede correr mientras se mantiene pulsada la tecla 'Z'.

Mario puede saltar sobre los enemigos para eliminarlos y recoger monedas al chocar contra ellas.

## 3.4 Goomba

Los goombas poseen los mismos componentes que Mario además de aiBounce (para que rebote) y enemy para que haga algo cuando colisiona con Mario. Se mueven de izquierda a derecha y rebotan cuando colisionan con alguna tubería u otro enemigo, y mueren si son pisados por Mario.

# 3.5 Bloopa

Poseen un comportamiento similar al de los goombas y además saltan cada cierto tiempo hacia la derecha o hacia la izquierda de forma aleatoria. También mueren cuando son pisados po Mario.

## 3.6 fin del juego al morir

Mario dispone de hasta 3 vidas, las cuales puede perder si choca contra algún enemigo o si se cae del nivel. Cuando pierde una vida se reinicia el nivel y el contador de monedas se restaura a sus valores iniciales. Trás perder las 3 vidas Mario muere y aparece la pantalla de game over con un boton para jugar de nuevo.

## 3.7 fin del juego al ganar

Mario gana la partida cuando llega hasta la princesa, siendo así que se muestra una pantalla como la de game over con un boton para jugar de nuevo.

## 3.8 Menú de inicio

En la pantalla de inicio podemos iniciar el juego pulsando la tecla 'enter'.

## 3.9 Animaciones

Todos los objetos del juego poseen sus propias animaciones las cuales cargamos en Q.loadTMX(). Para ello llamanos a compileSheets() para cada par de .png y .json con las respectivas imagenes y coordenadas de los sprites. A continuación creamos las animaciones con Q.animations().

## 3.10 Monedas y HUD

Las monedas heredan de Sprite y para animarlas usamos tween, luego le hemos añadido dicho componente. en cuanto al HUD representa el número de monedas conseguidas en esta partida (si Mario nuere se resetea) y las vidas que nos quedan para llegar hasta la princesa Peach.

## 3.11 Componente para los enemigos

Substituye a la clase enemy que teníamos antes para centralizar el comportamiento básico de los enemigos. Este componente se encarga de gestionar las colisiones laterales e inferior de los enemigos con Mario (la colision superior se ha definido para cada enemigo dado que hemos incluido la planta piraña).

## 3.12 Sonidos

Los hemos cargados con una llamaza a load() y hemos usado los .ogg. Para poder usarlos en el juego al inicializar el objeto Quintus hemos determinado los formatos .mp3 y .ogg como audios soportados y los hemos habilitado con enableSound(). El sonido del juego se arranca nada más presionar la tecla 'enter' y para cuando mario muere o llega hasta Peach.

## 4 Mejoras y ampliaciones

Hemos añadido las siguientes mejoras:
 - vidas: Mario tiene 3 intentos para llegar hasta la princesa antes de perder.
 - planta piraña: la planta piraña aparece en las tuberías y cuando Mario choca con ellas muere.
 - modificación sobre el nivel: se han añadido tuberías y se ha ampliado el nivel para poder probar todos los elementos de la practica.
