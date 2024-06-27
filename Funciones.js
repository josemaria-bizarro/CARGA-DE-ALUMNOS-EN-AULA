//****  LAS FUNCIONES DOGET / INCLUDE SON NECESARIAS */
function doGet()
{
    const html=HtmlService.createTemplateFromFile('Main');
    const irteeran=html.evaluate();
    return irteeran;
}

function incluye(archivo)
{
    return HtmlService.createHtmlOutputFromFile(archivo).getContent();
}

function obtieneOpcEdu() // OBTIENE DATOS DE OPC EDU DE DB PARA CARGAR DATALIST
{
    datuaOpcEdu=bdOpcEdu.getDataRange().getDisplayValues();
    datuaOpcEdu.shift();
    return datuaOpcEdu;
}

function obtieneCicloEsc(wsOpcEdu)          //OBTIENE DATOS DE CICLO ESC DE DB
{
    var azkenIlara= bdPeriodo.getLastRow();
    var cicloPaso=bdPeriodo.getRange(3,1,azkenIlara,3).getDisplayValues();
    
    const datuaCicloEsc=cicloPaso.filter(ilara=>ilara[1]!=""&&ilara[2]==wsOpcEdu);
    opcEduW=wsOpcEdu;
    if (datuaCicloEsc.length>0)
    {
        return datuaCicloEsc;
    }
    else    
    {
        console.log("filtro vacio ciclo escolar");
    }
    
}

function seleccionaAulas(datuak)
{
    /*
OBTIENE LAS CLASES EXISTENTES
FILTRA POR 
    OPC EDUCATIVA - TRES PRIMERAS LETRAS DE CAMPO - description == idOpEd
    ACTIVOS EN CAMPO - courseState == "ACTIVOS"
    CICLO ESCOLAR EN CAMPO - Room == periodoW
    aulasW. push() //contiene los datos de las aulas seleccionadas
*/

werror=0;

try
{
    opcEduca=datuak[0];
    var cursosW=Classroom.Courses.list().courses; //obtiene todos los cursos
    cicloEsc=datuak[1];
}
catch(err)
{
    var msg ="Error al intentar obtener los cursos"
    mensajeError(msg);
    werror=1;
    return
}

datuaOpcEdu=bdOpcEdu.getDataRange().getDisplayValues();
// OBTIENE LA CLAVE DE LA OPC EDU
var datuaOpcEduFil =datuaOpcEdu.filter(ilara=>ilara[0]==datuak[0]);

if (datuaOpcEduFil.length >0)
{
    idOpEd = datuaOpcEduFil[0][2];
    opcEdu = datuaOpcEduFil[0][0];
}
else
{
    var msg ="Error en clave de opc edu"
    mensajeError(msg);
    werror=1;
    return
}

try{                    //filtra los cursos por activos, ciclo y clave de opc edu
    
    var cursosFil=cursosW.filter(ilara=>ilara.courseState == "ACTIVE" && ilara.room==cicloEsc && ilara.description.substring(0,3) ==idOpEd&&ilara.section!="ESPECIAL")
     
     if (cursosFil.length>0)
     {           
        werror=procesoAula(cursosFil);
        return werror;
         
     }
     else
     {
         console.log("ERROR cursosFil.description.substring(0,3) "+ cursosFil.description);
         console.log("Periodo: "+periodoW);
         console.log("Opc Edu: "+idOpEd);
         console.log(cursosW);
         var msg ="ERROR no encontro aulas de la Opc Edu, Ciclo Esc y no Especiales "
            mensajeError(msg);
            werror=1;
            return
     }
 }
 catch(err)
 {
     console.log("Error al obtener todos los cursos... Error: "+err+"  Cursosw: "+cursosFil)
     werror=1;
     return werror;
 }

}

function mensajeError(msg)  //Muestra un mensaje de error
{
  var html=HtmlService.createHtmlOutput(msg)
  .setWidth(400)
  .setHeight(50);
  return html;
}

function procesoAula(cursosFil)
{
    /*
        PROCESO POR AULA
        OBTIENE LOS SIGUIENTES DATOS:
            NOMBRE DEL AULA
            ID DEL AULA
            GRUPOS
                OBTIENE DE CAMPO - section LOS GRUPOS Y *** SUB GRUPOS ***PARA OBTENER ALUMNOS POR AULA
        OBTIENE ALUMNOS  DE CATALOGO ALUMNOS, SEGUN GRUPOS, ACTIVOS E INACTIVOS
                OBTIENE:
                    INSTITUCIONAL
                ORDENAR AZ
        RESULTADO DEL PROCESO
            ESCRIBE DATOS EN TABLA DE SALIDA PARA POSTERIOR PROCESO
    */
    var lastindex=0;
    werror=0;
    warro=1
    var wnameAula="";
    var kaldeaW=[]; //ARRAY PARA GRUPOS
    var salidaArray=[]; //ARRAY PARA LA SALIDA

    cursosFil.forEach(ilara=>          
    //******************* proceso por cada AULAS SEGUN OPC EDU Y PERIODO
    {      
        widAula=ilara.id;         
        wname=ilara.name;
        /*
        GRUPOS
            OBTIENE DE CAMPO - section LOS GRUPOS PARA OBTENER ALUMNOS
        */
       //RUTINA PARA SEPARAR LOS GRUPOS 
            
        wkaldea=ilara.section;       
        var kaldeaP=wkaldea;
        var resto=kaldeaP;  
        var inicio=0;
        for(var k=0;k<10;k++)
         {   
            var wkaldeaLen=kaldeaP.length-1; //         resta 1 a la longitud porque se usa base 0

            if (resto.substring(wkaldeaLen,wkaldeaLen+1)=="")
            {
                //wkaldeaLen--    
                resto=resto.substring(0,wkaldeaLen) 
            }
            var windex =resto.lastIndexOf(" "); 
            if(windex==0)
            {
                inicio=0;
            }
            else
            {
                inicio=windex+1;
            }

            var kaldea1=resto.substring(inicio,wkaldeaLen+1);
            var R=wkaldeaLen-(wkaldeaLen-windex);
            if(R>0)
            {
                resto=resto.substring(0,R);
            }
            else
            {
                k=10
            }
            
            kaldeaW.push([kaldea1])
         }

         //PROCESO POR CADA GRUPO
         kaldeaW.forEach(ilara=>
            {
                //separa el grupo del subgrupo obteniendo un campo con grupo y otro con subgrupo
                var wgrupo=ilara[0];
                var wgpo=wgrupo.substring(0,wgrupo.length-1);
                var wsbgpo=wgrupo.substring(wgrupo.length-1,wgrupo.length)
                
                //Obtiene alumnos del catalogo filtrado por grupo y subgrupo
                var walumnos=bdikasleOrria.getDataRange().getDisplayValues();
                var walumnosF=walumnos.filter(ilara=> ilara[5]==wgpo && ilara[6]==wsbgpo && ilara[13]!="BAJA")
                if (walumnosF.length>0)
                    {
                        //Por cada alumno obtenido crea entrada en array con correo,grupo/subgrupo,aula,id,"ALTA"
                        walumnosF.forEach(ilara=>
                        {
                            salidaArray.push([ilara[1],wgrupo,wname,widAula,"ALTA"]);
                        }
                        )
                    }
                    else
                    {
                        console.log("no hay alumnos en grupo "+wgrupo)
                        werror=1;
                    }
                
                //al final de los grupos crea entrada de array vacia para separar aulas
            }
         )
         salidaArray.push(["","","","",""]);
         kaldeaW=[];
    })
  //genera salida de datos
    var ufila=manejoOrria.getLastRow()+1;
    try
    {
        manejoOrria.getRange(ufila,2,salidaArray.length,5).setValues(salidaArray);
        werror=0;
    }
    catch(err)
    {
        console.log("Error en archivo de Manejo de Aulas")
        var msg ="Error en archivo de Manejo de Aulas"
        mensajeError(msg);
        werror=1;
    return werror;
    }
    
    return werror;
}