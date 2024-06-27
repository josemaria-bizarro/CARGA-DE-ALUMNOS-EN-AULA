const bd = SpreadsheetApp.openById('1T5KQCvXiYsGewSoc_A8qugUwSs-ft1NNds4oaNgQxkw');
const bdAsigna=bd.getSheetByName('TABLA ASIGNATURAS');
const bdPeriodo=bd.getSheetByName('PERIODOS EDUCATIVOS');
const bdOpcEdu=bd.getSheetByName('OPCIONES EDUCATIVAS');
const bdgrupo=bd.getSheetByName('GRUPOS');
const bdikasle=SpreadsheetApp.openById('1kzmgvrbkQ7ehUslRxR4ghkpSeI2yT99M3h-Dyo-EEVY');
const bdikasleOrria=bdikasle.getSheetByName('ACTIVOS_FORMATEADO');
const manejoAulas=SpreadsheetApp.openById('1ZnOn67CEQpaPSlYA0SKl_C_vSL5ziKALM2H-UhleuIM');
const manejoOrria=manejoAulas.getSheetByName('ALTA');
let datuaAsigna;
let werror=0;
let opcEduca="";
let cicloEsc="";
let wname="";                          //nombre del aula
let wkaldea="";                      //grupos en aula
let widAula="";                      //Id del aula
