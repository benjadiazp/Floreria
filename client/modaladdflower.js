Template.modaladdflower.helpers({
    currentFlower()
    {
        doc=Session.get("FlorSeleccionada");
        doc.img=doc.img?doc.img:"img/flower.png"
        return doc;

    },
    categoriasFlor()
    {
        return Session.get("CategoriasFlor").map(function(c){
            let cat = {
                nombre: c
            };
            return cat;
        });
    }
});

Template.modaladdflower.events({
    "click #btnG": function(e)
    {
        let doc = {};
        let flower = Session.get("FlorSeleccionada") ? Session.get("FlorSeleccionada") : {};
        let name = $("#input-flower-name").val();
        let description = $("#input-flower-description").val();
        let precio= $("#input-flower-Price").val();
        let categorias = Session.get("CategoriasFlor") ? Session.get("CategoriasFlor") : [];
        doc.name = name;
        doc.img=Session.get("FlorSeleccionada") ? Session.get("FlorSeleccionada") : {};
        doc.description = description;
        doc.precio=precio;
        doc.categorias = categorias;
        doc.ancho=$("#input-flower-ancho").val();
        doc.alto=$("#input-flower-alto").val();

        if(doc.name!="" ){
            if (doc.description!="" ) {
                if (doc.precio>0){
                    if(doc.ancho>0){

                        if(doc.alto>0){
                            if (categorias.length>0) {
                                if($("#input-category").val()==""){
                                Meteor.call("AddFlower", flower ? flower._id : false, doc, function (err, resp)
                                {
                                    if (!err)
                                    {
                                        if (!flower._id)
                                        {
                                            flower._id = resp;
                                        }
                                    } else console.warn(err);
                                });
                                $("#modal-ingreso-flor").hide();
                                console.log("guardando");
                                swal("exito", "guardado correctamente", "success");
                            }else{
                                swal("revise categoria", "favor agregar cat o borrar la entrada", "error");
        
                            }
                            }else{
        
                                swal("error", "por favor ingrese al menos una categoria", "error");
        
                            }
                        }else{
                            swal("error", "por favor ingrese el alto ", "error");
                        }
                    }else{

                    swal("error", "por favor ingrese el ancho ", "error");
                    }
                   
                   



                }else{
                    // LANZAR error precio
                    swal("error", "por favor ingrese el precio", "error");

                }

            }else{
                //lanzar error de descricion
                swal("error", "por favor ingrese una descrpición", "error");

            }


        }else{
            // lanzar del nombre
            swal("error", "por favor complete el nombre", "error");

        }
    },

    "click .btnBorrar":function(e){
        let NewCat=[];
        let cont=0;
       let categorias= Session.get("CategoriasFlor");
          for (let index = 0; index < categorias.length; index++) {
            if(categorias[index]!=e.currentTarget.id){
                console.log(categorias[index])
                NewCat[cont]=categorias[index];
                cont++;
        }
          }

        Session.set("CategoriasFlor",NewCat);
        swal("exito", "borrado correctamente", "success");
    },
    "click .btnBorrarFoto":function(e){
        let flower = Session.get("FlorSeleccionada") ? Session.get("FlorSeleccionada") : {};
        if(flower!={}){
                flower.img="img/flower.png";
        }
        Session.set("FlorSeleccionada",flower);

    }
});
