export default {
  render(h) {
    let { $slots, pageInfo } = this,
      { page, pageSize, checks } = pageInfo || {},
      children = $slots.default;
    page = page - 0 || 0;
    pageSize = pageSize - 0 || 10;
    return (
      <div>
        <table>
          <thead>
            <tr>
              <td>
                <input
                  type="checkbox"
                  onChange={({ currentTarget: { value } }) => {}}
                />
              </td>
              <td>No.</td>
            </tr>
          </thead>
          <tbody>
            {children
              .map((child, index) => {
                child.children = [
                  <td>
                    <input
                      type="checkbox"
                      checked={checks[index] ? "checked" : ""}
                      onChange={({ currentTarget: { checked } }) => {
                        if (checked) {
                          checks[index] = true;
                        } else {
                          delete checks[index];
                        }
                        checks = Object.assign({}, checks);
                        this.checked({
                          page,
                          pageSize,
                          checks
                        });
                      }}
                    />
                  </td>
                ].concat(child.children);
                return child;
              })
              .slice(page * pageSize, (page + 1) * pageSize)}
          </tbody>
        </table>
        <select
          value={pageSize}
          onChange={({ currentTarget: { value } }) => {
            this.pageSizeChanged({
              page: 0,
              pageSize: value,
              checks
            });
          }}
        >
          {[5, 10, 15, 20].map(num => {
            return <option value={num}>{num}</option>;
          })}
        </select>
        <select
          value={page}
          onChange={({ currentTarget: { value } }) => {
            this.pageChanged({
              page: value,
              pageSize,
              checks
            });
          }}
        >
          {[0, 1, 2, 3].map(num => {
            return <option value={num}>{num}</option>;
          })}
        </select>
      </div>
    );
  },
  props: ["pageInfo"],
  model: {
    prop: "pageInfo",
    event: "pageSizeChange"
  },
  methods: {
    checked(value) {
      this.$emit("pageSizeChange", value);
    },
    pageChanged(value) {
      this.$emit("pageSizeChange", value);
    },
    pageSizeChanged(value) {
      this.$emit("pageSizeChange", value);
    }
  }
};
