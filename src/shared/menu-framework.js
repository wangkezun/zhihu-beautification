import { escapeHtml } from './escape-html.js';

// 初始化菜单默认值到 GM 存储
// 支持新的对象格式: { key, default, children?: [...] }
export function initMenuValues(menu_ALL) {
  for (const item of menu_ALL) {
    if (GM_getValue(item.key) == null) {
      GM_setValue(item.key, item.default);
    }
    if (item.children) {
      for (const child of item.children) {
        if (GM_getValue(child.key) == null) {
          GM_setValue(child.key, child.default);
        }
      }
    }
  }
}

// 返回菜单值（直接读取 GM 存储）
export function menu_value(key) {
  return GM_getValue(key);
}

// 菜单注册器注入：入口脚本注册实现，功能模块通过 refreshMenu() 触发重新注册
let menuRegistrar = null;
export function setMenuRegistrar(fn) {
  menuRegistrar = fn;
}
export function refreshMenu() {
  if (menuRegistrar) menuRegistrar();
}

// 脚本设置弹窗
// children: [{ key, label, tips?, inputType?: 'text' }]
export function menu_setting(title, tips, children) {
  let _html = `<style class="zhihuE_SettingStyle">.zhihuE_SettingRoot {position: absolute;top: 50%;left: 50%;-webkit-transform: translate(-50%, -50%);-moz-transform: translate(-50%, -50%);-ms-transform: translate(-50%, -50%);-o-transform: translate(-50%, -50%);transform: translate(-50%, -50%);width: auto;min-width: 400px;max-width: 600px;height: auto;min-height: 150px;max-height: 400px;color: #535353;background-color: #fff;border-radius: 3px;}
.zhihuE_SettingBackdrop_1 {position: fixed;top: 0;right: 0;bottom: 0;left: 0;z-index: 203;display: -webkit-box;display: -ms-flexbox;display: flex;-webkit-box-orient: vertical;-webkit-box-direction: normal;-ms-flex-direction: column;flex-direction: column;-webkit-box-pack: center;-ms-flex-pack: center;justify-content: center;overflow-x: hidden;overflow-y: auto;-webkit-transition: opacity .3s ease-out;transition: opacity .3s ease-out;}
.zhihuE_SettingBackdrop_2 {position: absolute;top: 0;right: 0;bottom: 0;left: 0;z-index: 0;background-color: rgba(18,18,18,.65);-webkit-transition: background-color .3s ease-out;transition: background-color .3s ease-out;}
.zhihuE_SettingRoot .zhihuE_SettingHeader {padding: 10px 20px;color: #fff;font-weight: bold;background-color: #3994ff;border-radius: 3px 3px 0 0;}
.zhihuE_SettingRoot .zhihuE_SettingMain {padding: 10px 20px;border-radius: 0 0 3px 3px;}
.zhihuE_SettingHeader span {float: right;cursor: pointer;}
.zhihuE_SettingMain input {margin: 10px 6px 10px 0;vertical-align:middle;}
.zhihuE_SettingMain input[type=text] {margin: 5px 6px 5px 0;padding-block: 0;}
.zhihuE_SettingMain input[name=zhihuE_Setting_Checkbox] {cursor: pointer;}
.zhihuE_SettingMain label {margin-right: 20px;user-select: none;cursor: pointer;vertical-align:middle;}
.zhihuE_SettingMain hr {border: 0.5px solid #f4f4f4;}
[data-theme="dark"] .zhihuE_SettingRoot {color: #adbac7;background-color: #343A44;}
[data-theme="dark"] .zhihuE_SettingHeader {color: #d0d0d0;background-color: #2D333B;}
[data-theme="dark"] .zhihuE_SettingMain hr {border: 0.5px solid #2d333b;}</style>
        <div class="zhihuE_SettingBackdrop_1"><div class="zhihuE_SettingBackdrop_2"></div><div class="zhihuE_SettingRoot">
            <div class="zhihuE_SettingHeader">${escapeHtml(title)}<span class="zhihuE_SettingClose" title="点击关闭"><svg class="Zi Zi--Close Modal-closeIcon" fill="currentColor" viewBox="0 0 24 24" width="24" height="24"><path d="M13.486 12l5.208-5.207a1.048 1.048 0 0 0-.006-1.483 1.046 1.046 0 0 0-1.482-.005L12 10.514 6.793 5.305a1.048 1.048 0 0 0-1.483.005 1.046 1.046 0 0 0-.005 1.483L10.514 12l-5.208 5.207a1.048 1.048 0 0 0 .006 1.483 1.046 1.046 0 0 0 1.482.005L12 13.486l5.207 5.208a1.048 1.048 0 0 0 1.483-.006 1.046 1.046 0 0 0 .005-1.482L13.486 12z" fill-rule="evenodd"></path></svg></span></div>
            <div class="zhihuE_SettingMain"><p>${escapeHtml(tips)}</p><hr>`;
  for (const child of children) {
    if (child.inputType === "text") {
      _html += `<label>${child.tips || child.label}：<input name="${child.key}" type="text" oninput="value=value.replace(/[^\\d]/g,'')" value="${escapeHtml(GM_getValue(child.key))}" style="width: 50px;"></label><br>`;
    } else if (GM_getValue(child.key)) {
      _html += `<label><input name="zhihuE_Setting_Checkbox" type="checkbox" value="${child.key}" checked="checked">${child.label}</label><br>`;
    } else {
      _html += `<label><input name="zhihuE_Setting_Checkbox" type="checkbox" value="${child.key}">${child.label}</label><br>`;
    }
  }
  _html += `</div></div></div>`;
  document.body.insertAdjacentHTML("beforeend", _html);
  setTimeout(function () {
    const doc = document.querySelector(".zhihuE_SettingBackdrop_1");
    if (!doc) return;
    doc.querySelector(".zhihuE_SettingClose").onclick = function () {
      this.parentElement.parentElement.parentElement.remove();
      document.querySelector(".zhihuE_SettingStyle").remove();
    };
    doc.querySelector(".zhihuE_SettingBackdrop_2").onclick = function (event) {
      if (event.target == this) {
        document.querySelector(".zhihuE_SettingClose").click();
      }
    };
    doc
      .querySelectorAll("input[name=zhihuE_Setting_Checkbox]")
      .forEach(function (checkBox) {
        checkBox.addEventListener("click", function () {
          GM_setValue(this.value, this.checked);
        });
      });
    doc.querySelectorAll("input[type=text]").forEach(function (textInput) {
      textInput.onchange = function () {
        GM_setValue(this.name, this.value);
      };
    });
  }, 100);
}
