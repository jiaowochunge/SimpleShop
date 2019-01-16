/**
 *
 */
package ai.bell.shop.web.ctl.admin;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @author john
 *
 */
@Controller
@RequestMapping("admin")
public class CommonCtl extends BaseCtl {

	@GetMapping("index")
	String index() {
		return "admin/index";
	}

}
