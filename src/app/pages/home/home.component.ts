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
  }

  seedDummy(): void {
    this.modelArray = this.dataModelForm.get("model") as FormArray;
    this.modelArray.push(
      this.fb.group({
        propertyName: ["gender", Validators.required],
        propertyType: ["Boolean", Validators.required],
        required: [false, Validators.required]
      })
    );

    this.modelArray.push(
      this.fb.group({
        propertyName: ["age", Validators.required],
        propertyType: ["Number", Validators.required],
        required: [true, Validators.required]
      })
    );

    this.modelArray.push(
      this.fb.group({
        propertyName: ["name", Validators.required],
        propertyType: ["String", Validators.required],
        required: [true, Validators.required]
      })
    );
  }

  addModelGroup(): FormGroup {
    return this.fb.group({
      propertyName: ["", Validators.required],
      propertyType: ["", Validators.required],
      required: [true, Validators.required]
    });
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
        if (item.required) {
          schemaBody = schemaBody.concat(`
          ${item.propertyName}: {
              type: ${this.deduceSchemaType(item.propertyType)},
              required: true
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
        formBody = formBody.concat(`
        ${item.propertyName}: [''${
          item.required ? ",[Validators.required]" : ""
        }],`);
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
        ${item.propertyName}: ${this.deduceModelType(item.propertyType)}${
          item.required ? "?" : ""
        },`);
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
