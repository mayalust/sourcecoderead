import Main from "../src/main.vue";
import { mount } from "@vue/test-utils";
describe("abc", () => {
  test("Main.b == 10", () => {
    const { vm } = mount(Main);
    expect(vm.datas.length).toBe(20);
  });
});
