document.addEventListener("DOMContentLoaded", () => {
  const uploadButton = document.querySelector(".upload-btn");
  const imagePreview = document.querySelector(".recipe-img");

  // Create a hidden input for file selection
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  uploadButton.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  
  // Add more ingredients
  const addIngredientBtn = document.querySelector(".add-btn");
  const ingredientTextarea = document.querySelector("textarea[placeholder='Enter list of ingredients...']");

  addIngredientBtn.addEventListener("click", () => {
    const newTextarea = ingredientTextarea.cloneNode();
    newTextarea.value = "";
    ingredientTextarea.parentNode.insertBefore(newTextarea, addIngredientBtn);
  });

  document.addEventListener("DOMContentLoaded", () => {
    // === MAIN IMAGE PREVIEW ===
    const uploadButton = document.querySelector(".upload-btn");
    const imagePreview = document.querySelector(".recipe-img");
  
    const mainImageInput = document.createElement("input");
    mainImageInput.type = "file";
    mainImageInput.accept = "image/*";
    mainImageInput.style.display = "none";
    document.body.appendChild(mainImageInput);
  
    uploadButton.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent default behavior if button is in a form
      mainImageInput.click();
    });
  
    mainImageInput.addEventListener("change", () => {
      const file = mainImageInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  
    // === ADD NEW INGREDIENT TEXTAREA ===
    const addIngredientBtn = document.querySelector(".add-btn");
    const ingredientTextarea = document.querySelector("textarea[placeholder='Enter list of ingredients...']");
  
    addIngredientBtn.addEventListener("click", () => {
      const newTextarea = ingredientTextarea.cloneNode();
      newTextarea.value = "";
      ingredientTextarea.parentNode.insertBefore(newTextarea, addIngredientBtn);
    });
  
    // === ADD IMAGE TO DIRECTIONS TEXTAREA ===
    const addImgBtn = document.querySelector(".add-img-btn");
    const directionsTextarea = document.querySelector("textarea[placeholder='Enter direction by path...']");
  
    const directionImgInput = document.createElement("input");
    directionImgInput.type = "file";
    directionImgInput.accept = "image/*";
    directionImgInput.style.display = "none";
    document.body.appendChild(directionImgInput);
  
    addImgBtn.addEventListener("click", () => {
      directionImgInput.click();
    });
  
    directionImgInput.addEventListener("change", () => {
      const file = directionImgInput.files[0];
      if (file) {
        const fakePath = `images/${file.name}`;
        const imageMarkdown = `\n\n![Step image](${fakePath})\n`;
        directionsTextarea.value += imageMarkdown;
      }
    });
  });
});