document.getElementById('citaForm').addEventListener('submit', function(e){
  e.preventDefault();
  const nombre=document.getElementById('nombre').value;
  const correo=document.getElementById('correo').value;
  const telefono=document.getElementById('telefono').value;
  const fecha=document.getElementById('fecha').value;
  const hora=document.getElementById('hora').value;
  const mensaje=`Hola, soy ${nombre}. Mi correo es ${correo}, mi número es ${telefono}. Quiero reservar una cita el ${fecha} a las ${hora}.`;
  window.open(`https://wa.me/573202301202?text=${encodeURIComponent(mensaje)}`,'_blank');
});