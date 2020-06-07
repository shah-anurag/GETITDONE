import "material-design-icons-iconfont/dist/material-design-icons.css"; // Ensure you are using css-loader
import Vue from "vue";
import Vuetify from "vuetify/lib";
import colors from "vuetify/lib/util/colors";

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: "md"
  },
  theme: {
    themes: {
      light: {
        primary: colors.deepPurple.accent3,
        success: colors.purple.accent3
      }
    }
  }
});
