import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormArray } from "@angular/forms";
@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  dataModelForm: FormGroup;

  showCode: boolean;

  modelArray: FormArray;

  mongooseSchemaTypes: string[] = [
    "String",
    "Number",
    "Date",
    "Buffer",
    "Boolean",
    "Mixed",
    "ObjectId",
    "Array",
    "Decimal128",
    "Map"
  ];

  schemaTemplate: string;
  modelTemplate: string;

  formHeader: string;
  formTemplate: string;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.dataModelForm = this.fb.group({
      model: this.fb.array([this.addModelGroup()])
    });
    this.pushGroup();
  }

  seedDummy(): void {
    this.dataModelForm = this.fb.group({
      model: this.fb.array([])
    });
    this.modelArray = this.dataModelForm.get("model") as FormArray;
    this.modelArray.push(
      this.fb.group({
        propertyName: ["gender", Validators.required],
        propertyType: ["Boolean", Validators.required],
        default: ["male"],
        required: [false, Validators.required],
        propLength: [false],
        minLength: [0],
        maxLength: [0]
      })
    );

    this.modelArray.push(
      this.fb.group({
        propertyName: ["age", Validators.required],
        propertyType: ["Number", Validators.required],
        default: ["20"],
        required: [true, Validators.required],
        propLength: [true],
        minLength: [1],
        maxLength: [2]
      })
    );

    this.modelArray.push(
      this.fb.group({
        propertyName: ["name", Validators.required],
        propertyType: ["String", Validators.required],
        default: [],
        required: [true, Validators.required],
        propLength: [true],
        minLength: [3],
        maxLength: [9]
      })
    );
  }

  addModelGroup(): FormGroup {
    return this.fb.group({
      propertyName: ["", Validators.required],
      propertyType: ["", Validators.required],
      default: [""],
      required: [true, Validators.required],
      propLength: [false, Validators.required],
      minLength: [""],
      maxLength: [""]
    });
  }

  getModelGroup(index: number): FormGroup {
    if (this.modelArray && this.modelArray.length) {
      const formGroup = this.modelArray.controls[index] as FormGroup;
      return formGroup;
    }
  }

  pushGroup(): void {
    this.modelArray = this.dataModelForm.get("model") as FormArray;
    this.modelArray.push(this.addModelGroup());
  }

  onSubmit(): void {
    this.buildSchema(this.dataModelForm.value.model);
    this.buildModel(this.dataModelForm.value.model);
    this.buildForm(this.dataModelForm.value.model);
    this.showCode = !this.showCode;
  }

  buildSchema(model): void {
    let schemaBody = "";

    model.map(item => {
      if (item.propertyName) {
        if (item.required && item.propLength) {
          schemaBody = schemaBody.concat(`
          ${item.propertyName}: {
              type: ${this.deduceSchemaType(item.propertyType)},
              ${item.required ? "required: true," : ""}
              ${item.propLength ? `minlength:${item.minLength},` : ``}
              ${item.propLength ? `maxlength:${item.maxLength}` : ``}
            },
          `);
        } else if (item.required && !item.propLength) {
          schemaBody = schemaBody.concat(`
          ${item.propertyName}: {
              type: ${this.deduceSchemaType(item.propertyType)},
              ${item.required ? "required: true," : ""}
            },
          `);
        } else if (item.propLength && !item.required) {
          schemaBody = schemaBody.concat(`
          ${item.propertyName}: {
              type: ${this.deduceSchemaType(item.propertyType)},
              ${item.propLength ? `minlength:${item.minLength},` : ``}
              ${
                item.propLength ? `maxlength:${item.maxLength}` : ``
              }
            },
          `);
        } else {
          schemaBody = schemaBody.concat(`
          ${item.propertyName}: ${this.deduceSchemaType(item.propertyType)},`);
        }
      }
    });

    this.schemaTemplate = `const mySchema = new Schema{${schemaBody}}`;
  }

  buildForm(model): void {
    this.formHeader = `import { FormBuilder, FormGroup, Validators } from "@angular/forms";

    const myForm: FormGroup;

    constructor(private fb: FormBuilder){}`;

    let formBody = ``;

    model.map(item => {
      if (item.propertyName) {
        const requiredTemplate = item.required ? "Validators.required" : false;
        const lengthValidatorTemplate = item.propLength
          ? item.propertyType == "Number"
            ? `Validators.min(${item.minLength}), Validators.max(${
                item.maxLength
              })`
            : `Validators.minLength(${item.minLength}), Validators.maxLength(${
                item.maxLength
              })`
          : false;

        const controlSpec =
          requiredTemplate && lengthValidatorTemplate
            ? `[${requiredTemplate},${lengthValidatorTemplate}]`
            : `${
                requiredTemplate
                  ? `[${requiredTemplate}]`
                  : `[${lengthValidatorTemplate}]`
              }`;

        formBody = formBody.concat(`
        ${item.propertyName}: ['', ${controlSpec}]`);
      }
    });

    this.formTemplate = `ngOnInit() {
      this.myForm = this.fb.group({${formBody}
      });
    }`;
  }

  buildModel(model): void {
    let modelBody = "";

    model.map(item => {
      if (item.propertyName) {
        modelBody = modelBody.concat(`
        ${item.propertyName}${item.required ? "?" : ""}: ${this.deduceModelType(
          item.propertyType
        )},`);
      }
    });

    this.modelTemplate = `export interface myModel = {${modelBody}
    }`;
  }

  deduceModelType(type): string {
    switch (type) {
      case "Mixed":
        return "any";

      case "String":
        return "string";

      case "Number":
        return "number";

      case "Boolean":
        return "boolean";

      case "ObjectId":
        return "string";

      case "Decimal128":
        return "string";

      case "Array":
        return "[]";

      case "Map":
        return "any";

      default:
        return type;
    }
  }

  deduceSchemaType(type): string {
    switch (type) {
      case "Mixed":
        return "Schema.Types.Mixed";

      case "ObjectId":
        return "Schema.Types.ObjectId";

      case "Decimal128":
        return "Schema.Types.Decimal128";

      case "Map":
        return "Map";

      case "Array":
        return "[]";

      default:
        return type;
    }
  }
}
